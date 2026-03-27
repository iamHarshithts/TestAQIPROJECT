from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, joblib, os, gdown

App = Flask(__name__)

# ✅ Enable CORS
CORS(App, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

# ✅ Load Model
MODEL_PATH = "model/random_forest_model.pkl"

if not os.path.exists(MODEL_PATH):
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    gdown.download(
        "https://drive.google.com/uc?id=1M-JzFwzVUhLjO_ZyRSMNi8FpN3CYGztx",
        MODEL_PATH,
        quiet=False
    )

Model = joblib.load(MODEL_PATH)

FEATURES = ['pm2_5','pm10','no','no2','nox','nh3','co','so2','o3']

# ✅ CPCB Breakpoints
BREAKPOINTS = {
    "pm2_5": [[0,30,0,50],[30,60,51,100],[60,90,101,200],[90,120,201,300],[120,250,301,400],[250,400,401,500]],
    "pm10":  [[0,50,0,50],[50,100,51,100],[100,250,101,200],[250,350,201,300],[350,430,301,400],[430,500,401,500]],
    "no2":   [[0,40,0,50],[40,80,51,100],[80,180,101,200],[180,280,201,300],[280,400,301,400],[400,500,401,500]],
    "so2":   [[0,40,0,50],[40,80,51,100],[80,380,101,200],[380,800,201,300],[800,1600,301,400],[1600,2000,401,500]],
    "co":    [[0,1,0,50],[1,2,51,100],[2,10,101,200],[10,17,201,300],[17,34,301,400],[34,50,401,500]]
}

# ✅ AQI Category
def classify_aqi(aqi):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"

# ✅ Sub Index Calculation
def sub_index(c, pollutant):
    bp = BREAKPOINTS.get(pollutant)
    if not bp:
        return 0
    for cl, ch, il, ih in bp:
        if cl <= c <= ch:
            return il + ((ih - il)/(ch - cl))*(c - cl)
    return 500

# ✅ CPCB AQI
def calculate_cpcb_aqi(comp):
    co_mg = comp.get('co', 0)/1000
    indices = [
        sub_index(comp.get('pm2_5', 0), 'pm2_5'),
        sub_index(comp.get('pm10', 0), 'pm10'),
        sub_index(comp.get('no2', 0), 'no2'),
        sub_index(comp.get('so2', 0), 'so2'),
        sub_index(co_mg, 'co')
    ]
    return round(max(indices), 2)

# ✅ Get Pollution Data
def get_pollution(lat, lon):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid=YOUR_API_KEY"
    data = requests.get(url).json()["list"][0]["components"]

    return [
        data.get('pm2_5', 0),
        data.get('pm10', 0),
        data.get('no', 0),
        data.get('no2', 0),
        data.get('no', 0) + data.get('no2', 0),
        data.get('nh3', 0),
        data.get('co', 0),
        data.get('so2', 0),
        data.get('o3', 0)
    ]

# ✅ Routes
@App.route("/")
def home():
    return jsonify({"status": "API running"})

@App.route("/predict", methods=["GET", "OPTIONS"])
def predict():

    # 🔹 Handle preflight
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "lat & lon required"}), 400

    try:
        values = get_pollution(lat, lon)

        # 🔹 ML Prediction
        ml_aqi = round(Model.predict([values])[0], 2)

        comp_dict = dict(zip(FEATURES, values))

        # 🔹 CPCB AQI (Primary)
        cpcb_aqi = calculate_cpcb_aqi(comp_dict)



 

        return jsonify({
            "final_aqi": final_aqi,
            "cpcb_aqi": cpcb_aqi,
            "ml_aqi": ml_aqi,
            "category": classify_aqi(final_aqi),
            "difference": difference,
            "anomaly_detected": anomaly,
            "pollutants": comp_dict
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    App.run(debug=True)
