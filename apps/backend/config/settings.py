import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-local-key")
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")]
INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles", "corsheaders", "rest_framework", "rest_framework.authtoken", "catalog", "delivery"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware", "whitenoise.middleware.WhiteNoiseMiddleware", "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True, "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"
DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "NAME": os.getenv("POSTGRES_DB", "smartkio"), "USER": os.getenv("POSTGRES_USER", "smartkio"), "PASSWORD": os.getenv("POSTGRES_PASSWORD", "smartkio_local_only"), "HOST": os.getenv("POSTGRES_HOST", "localhost"), "PORT": os.getenv("POSTGRES_PORT", "5432")}}
if os.getenv("DJANGO_USE_SQLITE") == "1":
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {"staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"}}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOWED_ORIGINS = [value.strip() for value in os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",") if value.strip()]
CSRF_TRUSTED_ORIGINS = [value.strip() for value in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if value.strip()]
REST_FRAMEWORK = {"DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"], "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"]}
KIOSK_API_KEY = os.getenv("KIOSK_API_KEY", "")
NAVER_MAPS_CLIENT_ID = os.getenv("NAVER_MAPS_CLIENT_ID", "")
NAVER_MAPS_CLIENT_SECRET = os.getenv("NAVER_MAPS_CLIENT_SECRET", "")
NAVER_API_HUB_CLIENT_ID = os.getenv("NAVER_API_HUB_CLIENT_ID", "")
NAVER_API_HUB_CLIENT_SECRET = os.getenv("NAVER_API_HUB_CLIENT_SECRET", "")
