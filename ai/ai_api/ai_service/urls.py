from django.urls import path
from . import views

urlpatterns = [
    path('ai_api/generate',views.generate_view,name="generate_chat")
]

