from respa.settings import *

ROOT_URLCONF = 'hmlvaraus.urls'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 50,
}

INSTALLED_APPS += [
    'paytrailpayments'
]

PAYTRAIL_MERCHANT_ID = '13466'
PAYTRAIL_MERCHANT_SECRET = '6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ'

ALLOWED_HOSTS += [
    '10.0.1.121'
]

DEBUG = True
