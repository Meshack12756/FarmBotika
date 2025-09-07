#UNIT_TESTING

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.urls import reverse
import json

User = get_user_model()

class AuthTests(APITestCase):
    def test_registration_and_login(self):
        # 1) Register
        reg_url = reverse('register')
        reg_data = {
            "username": "testuser",
            "password": "pass123",
            "email": "t@test.com",
            "role": "FARMER"
        }
        reg_resp = self.client.post(reg_url, data=json.dumps(reg_data), content_type='application/json')
        self.assertEqual(reg_resp.status_code, 201)

        # 2) Fetch & verify the user
        user = User.objects.get(username='testuser')
        self.assertTrue(user.check_password('pass123'), "Password was not set correctly")
        self.assertTrue(user.is_active)
        user.email_verified = True
        user.save()

        # 3) Confirm reverse name
        login_url = reverse('token_obtainer_pair')
        self.assertTrue(login_url.startswith('/api/auth/token'), f"token_obtain_pair reversed to {login_url}")

        # 4) Attempt login
        login_resp = self.client.post(login_url, {"username": "testuser", "password": "pass123"}, format='json')
        self.assertEqual(login_resp.status_code, 200, f"Login failed, got {login_resp.status_code}: {login_resp.data}")
        self.assertIn('access', login_resp.data)
        self.assertIn('refresh', login_resp.data)


