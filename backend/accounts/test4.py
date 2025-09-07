# accounts/tests/test4.py

from django.urls import reverse
from rest_framework.test import APITestCase
from accounts.models import User

class RBACUserTests(APITestCase):
    def setUp(self):
        self.admin  = User.objects.create_user('admin',  password='a', role='ADMIN',  email='a@x.com')
        self.staff  = User.objects.create_user('staff',  password='s', role='STAFF',  email='s@x.com')
        self.farmer = User.objects.create_user('farm',   password='f', role='FARMER', email='f@x.com')

    def _login(self, user, pw):
        url = reverse('token_obtainer_pair')
        resp = self.client.post(url, {"username": user.username, "password": pw}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def test_user_list_rbac(self):
        url = reverse('user-list')
        # Farmer → forbidden
        self._login(self.farmer, 'f')
        self.assertEqual(self.client.get(url).status_code, 403)
        # Staff → forbidden
        self._login(self.staff, 's')
        self.assertEqual(self.client.get(url).status_code, 403)
        # Admin → OK
        self._login(self.admin, 'a')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.data) >= 3)

    def test_user_detail_rbac(self):
        detail = lambda u: reverse('user-detail', args=[u.id])

        # Farmer views own → 200
        self._login(self.farmer, 'f')
        self.assertEqual(self.client.get(detail(self.farmer)).status_code, 200)
        # Farmer views staff → 403
        self.assertEqual(self.client.get(detail(self.staff)).status_code, 403)

        # Staff views any → 200
        self._login(self.staff, 's')
        for u in (self.admin, self.farmer):
            self.assertEqual(self.client.get(detail(u)).status_code, 200)

        # Farmer updates own → 200; updates other → 403
        self._login(self.farmer, 'f')
        patch = {"bio": "hello"}
        self.assertEqual(self.client.patch(detail(self.farmer), patch, format='json').status_code, 200)
        self.assertEqual(self.client.patch(detail(self.staff),    patch, format='json').status_code, 403)

        # Admin deletes farmer → 204
        self._login(self.admin, 'a')
        self.assertEqual(self.client.delete(detail(self.farmer)).status_code, 204)
