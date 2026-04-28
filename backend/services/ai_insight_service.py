import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

def generate_gemini_fairness_report(metrics_data, flags_data, dataset_info):
    """
    Uses Google Gemini to generate a high-level fairness report.
    """
    if not client:
        return "Gemini API key not found. Please set GEMINI_API_KEY in your environment."

    prompt = f"""
    You are an expert AI Fairness Auditor. Analyze the following model fairness results and provide a 
    concise, professional summary for a corporate stakeholder report.
    
    DATASET INFO:
    {json.dumps(dataset_info, indent=2)}
    
    FAIRNESS METRICS DETECTED:
    {json.dumps(metrics_data, indent=2)}
    
    BIAS FLAGS DETECTED:
    {json.dumps(flags_data, indent=2)}
    
    INSTRUCTIONS:
    1. Summarize the overall bias risk (Critical, High, Medium, or Low).
    2. Identify the specific groups being most negatively impacted.
    3. Provide 3 actionable technical recommendations to mitigate these specific biases (e.g., reweighing, resampling, or specific data collection).
    4. Keep the tone professional and senior-level.
    5. Return the response in clean markdown.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error generating Gemini report: {str(e)}"

def generate_mitigation_recommendation(strategy, before_metrics, after_metrics):
    """
    Uses Gemini to analyze the impact of a specific mitigation strategy.
    """
    if not client:
        return None

    prompt = f"""
    Analyze the effectiveness of the '{strategy}' mitigation strategy.
    
    METRICS BEFORE:
    {json.dumps(before_metrics, indent=2)}
    
    METRICS AFTER:
    {json.dumps(after_metrics, indent=2)}
    
    Provide a 2-sentence expert summary of whether this strategy was successful and what the performance trade-off was.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except:
        return None
