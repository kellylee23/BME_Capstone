# from django.urls import path
# from .views import AnemiaPredictView

# urlpatterns = [
#     path("predict/", AnemiaPredictView.as_view(), name="anemia-predict"),
# ]


# # urls.py
# from django.urls import path
# from . import views

# urlpatterns = [
#     path('upload/', views.upload_and_predict, name='upload_and_predict'),
# ]

# anemic/urls.py

from django.urls import path
from ninja import NinjaAPI
from .api import router as anemic_router
from .api import nail_classify

api = NinjaAPI()
api.add_router("", anemic_router)

urlpatterns = [
    path("api/", api.urls),
    path('nail-classify/', nail_classify, name='nail-classify'),
]
