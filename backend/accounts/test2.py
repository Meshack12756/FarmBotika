# accounts/test2.py

import json
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()

class TokenRefreshAndProtectedTests(APITestCase):
    def setUp(self):
        # Create and mark a verified user
        self.user = User.objects.create_user(
            username="refreshtest",
            email="refresh@test.com",
            password="refreshpass",
            role="FARMER"
        )
        self.user.email_verified = True
        self.user.save()

    def test_refresh_and_access_protected(self):
        # 1) Obtain initial tokens
        obtain_url = reverse('token_obtainer_pair')
        resp = self.client.post(
            obtain_url,
            data=json.dumps({
                "username": "refreshtest",
                "password": "refreshpass"
            }),
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 200, resp.data)
        access = resp.data['access']
        refresh = resp.data['refresh']

        # 2) Refresh the access token
        refresh_url = reverse('token_refresh')
        refresh_resp = self.client.post(
            refresh_url, data=json.dumps({"refresh": refresh}), content_type='application/json'
        )
        self.assertEqual(refresh_resp.status_code, 200, refresh_resp.data)
        new_access = refresh_resp.data['access']
        self.assertTrue(new_access and new_access != access)

        # 3) Access the protected view with the new_access
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access}')
        protected_url = reverse('protected')
        prot_resp = self.client.get(protected_url)
        self.assertEqual(prot_resp.status_code, 200)
        # Expect greeting with username
        expected_message = f"Hello, {self.user.username}"
        self.assertEqual(prot_resp.data.get("detail"), expected_message)
