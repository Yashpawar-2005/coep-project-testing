from django.shortcuts import render
from django.http import JsonResponse,StreamingHttpResponse
import sys
import os
import sqlglot
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))  # Adds the parent folder to path
from django.views.decorators.csrf import csrf_exempt
from rag.embedding_operations import *
from .llm.llm import *
# Create your views here.

@csrf_exempt
def generate_view(req):
    if req.method=='POST':
        data = json.loads(req.body.decode('utf-8'))
        user_query = data.get('user_query')
        chat_history = data.get('chat_history')
        
        if not user_query:
            return JsonResponse({"err":"user query is required"},400)
        
        response = StreamingHttpResponse(
            generate_chat(user_query=user_query, chat_his=chat_history),
            content_type='text/event-stream'  # Ensures immediate delivery
        )
        response['Cache-Control'] = 'no-cache'  # Helps enforce real-time delivery
        response['X-Accel-Buffering'] = 'no'
        return response
        pass
    else:
        return JsonResponse({'err':"invalid request method"},400)

