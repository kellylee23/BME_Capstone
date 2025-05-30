"""
URL configuration for capstone_be project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path, include
# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi
# # from ninja import NinjaAPI
# # from anemic.api import router as anemia_router

# # api = NinjaAPI()
# # api.add_router("/anemia/", anemia_router)
# schema_view = get_schema_view(
#    openapi.Info(
#       title="Anemia Detection API",
#       default_version='v1',
#       description="Detect anemia using nail and conjunctiva images",
#    ),
#    public=True,
#    permission_classes=(permissions.AllowAny,),
# )

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     path("api/anemia/", include("anemic.urls")),
#  # Swagger URLs
#     path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
#     path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),


# ]

# capstone_be/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('anemic.urls')),  # anemic 앱의 URL 포함
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

