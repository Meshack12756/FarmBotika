from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .utils.inference import run_detection

@csrf_exempt
@login_required
def detect_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            input_data = data.get("input_data")
            category = data.get("category", "pest")
            result = run_detection(input_data, category)
            return JsonResponse(result)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "POST only"}, status=405)