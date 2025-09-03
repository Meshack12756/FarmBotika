# advisory/views.py
from django.shortcuts import render, redirect
from .models import SensorData
from .ml_core.crop import predict_top_4_crops
from .ml_core.seed import predict_top_3_seeds
from .ml_core.fertilizer import recommend_fertilizer
from datetime import datetime
import random

def advisory_wizard(request):
    sensor_data = SensorData.objects.latest('timestamp')
    step = request.POST.get('step', 'crop')

    selected_crop = request.session.get('selected_crop')
    selected_seed = request.session.get('selected_seed')
    planting_date = request.session.get('planting_date')

    context = {
        'sensor_data': sensor_data,
        'step': step,
        'selected_crop': selected_crop,
        'selected_seed': selected_seed,
    }

    if request.method == 'POST':
        if 'selected_crop' in request.POST:
            request.session['selected_crop'] = request.POST['selected_crop']
            return redirect('advisory_wizard')

        elif 'selected_seed' in request.POST:
            request.session['selected_seed'] = request.POST['selected_seed']
            request.session['planting_date'] = datetime.now().isoformat()
            return redirect('advisory_wizard')

        elif request.POST.get('step') == 'reset':
            request.session.flush()
            return redirect('advisory_wizard')

    features = {
        "ph": sensor_data.ph,
        "temperature": sensor_data.temperature,
        "humidity": sensor_data.humidity,
        "n": sensor_data.n,
        "p": sensor_data.p,
        "k": sensor_data.k,
        "altitude": sensor_data.altitude,
        "moisture_numeric": sensor_data.moisture_numeric
    }

    # Step 1: Crop prediction
    if not selected_crop:
        context['recommended_crops'] = predict_top_4_crops(features)

    # Step 2 & 3: Land preparation and Seed prediction
    if selected_crop:
        context['preparation_text'] = f"Land preparation for {selected_crop}: till soil to 20cm, irrigate lightly."
        if not selected_seed:
            top_seeds = predict_top_3_seeds(selected_crop, features)
            if top_seeds is None:
                context['seed_error'] = f"⚠️ Seed model or encoder for '{selected_crop}' not found. Please choose another crop or contact admin."
            else:
                context['recommended_seeds'] = top_seeds

    # Step 4: Fertilizer recommendation + soil health check
    if selected_seed:
        simulated_soil = random.choice([
            "loam", "clay", "sandy clay loam", "sandy loam", "silty clay"
        ])
        features['soil_type'] = simulated_soil
        features['crop'] = selected_crop

        def get_status(val):
            if val < 30: return "Low"
            elif val < 70: return "Medium"
            return "High"

        n_status = get_status(sensor_data.n)
        p_status = get_status(sensor_data.p)
        k_status = get_status(sensor_data.k)

        npk_def = []
        if n_status == "Low":
            npk_def.append("Nitrogen")
        if p_status == "Low":
            npk_def.append("Phosphorus")
        if k_status == "Low":
            npk_def.append("Potassium")

        status_list = [n_status, p_status, k_status]
        if status_list.count("Low") >= 2:
            soil_health = "Poor"
            soil_color = "red"
        elif "Low" in status_list or status_list.count("Medium") >= 2:
            soil_health = "Medium"
            soil_color = "yellow"
        else:
            soil_health = "Healthy"
            soil_color = "green"

        fertilizers = None
        if soil_health != "Healthy":
            fertilizers = recommend_fertilizer(features)

        context.update({
            'soil_type_used': simulated_soil,
            'n_status': n_status,
            'p_status': p_status,
            'k_status': k_status,
            'soil_health': soil_health,
            'soil_color': soil_color,
            'npk_deficiency': npk_def,
            'auto_fertilizers': fertilizers,
        })

    # Step 5: Growth tracking
    if planting_date:
        planted_dt = datetime.fromisoformat(planting_date)
        days = (datetime.now() - planted_dt).days

        if days <= 7:
            stage = "Germination"
        elif days <= 30:
            stage = "Vegetative"
        elif days <= 60:
            stage = "Flowering"
        else:
            stage = "Maturity"

        avg_harvest_days = 90
        days_remaining = max(avg_harvest_days - days, 0)

        context.update({
            'stage': stage,
            'days': days,
            'planting_date': planted_dt.strftime("%Y-%m-%d"),
            'days_remaining': days_remaining,
        })

    return render(request, 'dashboard/wizard.html', context)
