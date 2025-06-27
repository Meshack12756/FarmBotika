# accounts/test5.py

import json
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.tokens import default_token_generator
from accounts.models import User, PasswordResetCode

class FullAuthFlowTests(APITestCase):
    def test_end_to_end_auth_flow(self):
        # 1) Register a new user
        register_url = reverse('register')
        user_data = {
            "username": "fulluser",
            "email": "full@test.com",
            "password": "StartPass123",
            "role": "FARMER"
        }
        reg_resp = self.client.post(register_url, user_data, format='json')
        self.assertEqual(reg_resp.status_code, 201)

        # 2) Verify email via the token emailed
        user = User.objects.get(username="fulluser")
        token = default_token_generator.make_token(user)
        verify_url = reverse('verify-email') + f"?uid={user.id}&token={token}"
        ver_resp = self.client.get(verify_url)
        self.assertEqual(ver_resp.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

        # 3) Login with the verified account
        login_url = reverse('token_obtainer_pair')
        login_resp = self.client.post(
            login_url,
            {"username": "fulluser", "password": "StartPass123"},
            format='json'
        )
        self.assertEqual(login_resp.status_code, 200)
        access, refresh = login_resp.data['access'], login_resp.data['refresh']

        # 4) Request a password reset
        reset_req_url = reverse('password_reset_request')
        reset_req_resp = self.client.post(
            reset_req_url,
            {"identifier": "full@test.com"},
            format='json'
        )
        self.assertEqual(reset_req_resp.status_code, 200)

        # 5) Grab the latest reset code and perform verify
        prc = PasswordResetCode.objects.filter(user=user).latest('created_at')
        reset_ver_url = reverse('password_reset_verify')
        reset_ver_resp = self.client.post(
            reset_ver_url,
            {"identifier": "full@test.com", "code": prc.code, "new_password": "NewPass456"},
            format='json'
        )
        self.assertEqual(reset_ver_resp.status_code, 200)

        # 6) Login with the new password
        new_login = self.client.post(
            login_url,
            {"username": "fulluser", "password": "NewPass456"},
            format='json'
        )
        self.assertEqual(new_login.status_code, 200)
        new_access, new_refresh = new_login.data['access'], new_login.data['refresh']

        # 7) Logout (blacklist the refresh token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
        logout_url = reverse('logout')
        logout_resp = self.client.post(logout_url, {"refresh": new_refresh}, format='json')
        self.assertEqual(logout_resp.status_code, 200)

        # 8) Attempt refresh with blacklisted token → fail
        refresh_url = reverse('token_refresh')
        blocked = self.client.post(refresh_url, {"refresh": new_refresh}, format='json')
        self.assertEqual(blocked.status_code, 401)
