from pathlib import Path
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔐 Security Settings
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-*z3q13)3a!_@tr+79mxoi_+75%m2wi848(b87*m^8_kmi6$#ju')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

# 📦 Installed Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'accounts',
    'pestscan', 


    # 🧩 API & Auth
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

# 🧱 Middleware Stack
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⬅️ Must come first for CORS headers
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'accounts.middleware.LanguageMiddleware',  # ⬅️ Multilingual support middleware
]

ROOT_URLCONF = 'config.urls'

# 🧠 Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# 🗃️ Database Setup
USE_SQLITE = os.getenv('USE_SQLITE', 'True') == 'True'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3' if USE_SQLITE else 'django.db.backends.postgresql',
        'NAME': BASE_DIR / 'db.sqlite3' if USE_SQLITE else os.getenv('DB_NAME', 'farmbotika'),
        'USER': os.getenv('DB_USER', 'farmbotika_user') if not USE_SQLITE else '',
        'PASSWORD': os.getenv('DB_PASSWORD', 'yourpassword') if not USE_SQLITE else '',
        'HOST': os.getenv('DB_HOST', 'localhost') if not USE_SQLITE else '',
        'PORT': os.getenv('DB_PORT', '5432') if not USE_SQLITE else '',
    }
}

# 🔐 Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# 🌍 Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# 🖼️ Static and Media Files
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"

# 🔑 Auth
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'accounts.User'

# 🧩 REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# 🔐 JWT Token Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# 🌐 CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://farmbotika.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True

# 📧 Email Backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = 'no-reply@farmbotika.local'