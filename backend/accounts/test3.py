# test3.py

from django.urls import reverse
from rest_framework.test import APITestCase
from accounts.models import PasswordResetCode, User

class PasswordResetAndLogoutTests(APITestCase):
    def setUp(self):
        # Create a fresh user for each test
        self.user = User.objects.create_user(
            username="pwuser",
            password="initialPass1",
            email="pwuser@test.com",
            phone="0712345678",
            role="FARMER"
        )
        self.user.email_verified = True
        self.user.save()

    def test_password_reset_flow(self):
        # 1) Request a reset code (anonymous access)
        req_url = reverse('password_reset_request')
        resp = self.client.post(req_url,
                                {"identifier": "pwuser@test.com"},
                                format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["detail"], "Reset code sent.")

        # 2) Grab that code and verify it exists and is unexpired
        prc = PasswordResetCode.objects.filter(user=self.user).latest('created_at')
        self.assertFalse(prc.is_expired())

        # 3) Wrong code should 400
        bad_verify = self.client.post(reverse('password_reset_verify'),
                                      {"identifier": "pwuser@test.com",
                                       "code": "000000",
                                       "new_password": "Newpass1"},
                                      format='json')
        self.assertEqual(bad_verify.status_code, 400)

        # 4) Correct code resets password
        real_code = prc.code
        ok_verify = self.client.post(reverse('password_reset_verify'),
                                     {"identifier": "pwuser@test.com",
                                      "code": real_code,
                                      "new_password": "Newpass1"},
                                     format='json')
        self.assertEqual(ok_verify.status_code, 200)
        self.assertEqual(ok_verify.data["detail"], "Password reset successful.") 

        # 5) Old password no longer works
        login_url = reverse('token_obtainer_pair')
        old_login = self.client.post(login_url,
                                     {"username": "pwuser", "password": "initialPass1"},
                                     format='json')
        self.assertEqual(old_login.status_code, 401)

        # 6) New password works
        new_login = self.client.post(login_url,
                                     {"username": "pwuser", "password": "Newpass1"},
                                     format='json')
        self.assertEqual(new_login.status_code, 200)
        self.assertIn('access', new_login.data)
        self.refresh = new_login.data['refresh']

        def test_logout_blacklists_refresh_token(self):
            # 1) Log in to obtain both tokens
            login_url = reverse('token_obtainer_pair')
            login = self.client.post(
                login_url,
                {"username": "pwuser", "password": "initialPass1"},
                format='json'
            )
            self.assertEqual(login.status_code, 200)
            access_token  = login.data['access']
            refresh_token = login.data['refresh']

            # 2) Authenticate subsequent requests with the access token
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

            # 3) Call logout to blacklist the refresh token
            logout_resp = self.client.post(
                reverse('logout'),
                {"refresh": refresh_token},
                format='json'
            )
            self.assertEqual(logout_resp.status_code, 200)
            self.assertEqual(logout_resp.data['detail'], 'Logout successful.')

            # 4) Verify that using the same refresh token now fails
            blocked = self.client.post(
                reverse('token_refresh'),
                {"refresh": refresh_token},
                format='json'
            )
            self.assertEqual(blocked.status_code, 401)

