import streamlit as st
import joblib
import pandas as pd

# Load the optimized pipeline
@st.cache_resource
def load_model():
    return joblib.load('civicfix_model.joblib')

pipeline = load_model()

# UI Interface Setup
st.set_page_config(page_title="CivicFix Triage", page_icon="⬛", layout="centered")

# Inject Custom CSS for a clean, monochromatic UI
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Poppins', sans-serif;
    }
    
    /* Monochromatic Button */
    .stButton>button {
        background-color: #000000;
        color: #ffffff;
        border-radius: 6px;
        border: none;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
    }
    .stButton>button:hover {
        background-color: #333333;
        color: #ffffff;
    }
    
    h1, h2, h3 {
        font-weight: 600 !important;
        color: #000000;
    }
    </style>
""", unsafe_allow_html=True)

st.title("CivicFix Triage")
st.markdown("Enter the details of a municipal C3 service request to predict dispatch urgency.")

# Input Form
with st.form("triage_form"):
    st.subheader("Ticket Details")
    
    complaint_type = st.text_input("Complaint Department (e.g., 'Electricity', 'Water', 'Roads')")
    notification = st.text_input("Specific Fault Description (e.g., 'No Power', 'Burst Pipe')")
    
    col1, col2 = st.columns(2)
    with col1:
        ward = st.text_input("Ward Number (e.g., 'Ward 22')")
    with col2:
        suburb = st.text_input("Suburb (e.g., 'Mowbray')")
        
    st.markdown("---")
    st.subheader("Geographic Coordinates")
    
    col3, col4 = st.columns(2)
    with col3:
        lat = st.number_input("Latitude", value=-33.9200, format="%.4f")
    with col4:
        lon = st.number_input("Longitude", value=18.4200, format="%.4f")
        
    submitted = st.form_submit_button("Predict Urgency")

# Prediction Logic
if submitted:
    if not complaint_type or not notification:
        st.error("Please provide both the Complaint Department and the Fault Description.")
    else:
        fault_desc = f"{complaint_type} - {notification}"
        input_data = pd.DataFrame({
            'fault_description': [fault_desc],
            'Suburb_Clean': [suburb],
            'Ward': [ward],
            'Latitude': [lat],
            'Longitude': [lon]
        })
        
        prediction = pipeline.predict(input_data)[0]
        probabilities = pipeline.predict_proba(input_data)[0]
        confidence = probabilities[prediction] * 100
        
        st.markdown("---")
        if prediction == 1:
            st.error(f"⚠️ **HIGH URGENCY HAZARD DETECTED** (Confidence: {confidence:.1f}%)")
            st.markdown("*Explanation:* The system detected critical keywords associated with severe infrastructure failure. Immediate emergency dispatch is recommended.")
        else:
            st.success(f"✅ **ROUTINE MAINTENANCE** (Confidence: {confidence:.1f}%)")
            st.markdown("*Explanation:* The fault matches standard routine maintenance patterns. Assign to the standard queue.")

st.markdown("---")
st.caption("**Responsible Use Notice:** This is an advisory AI tool. It does not replace human judgement. Final dispatch authority must remain with the shift supervisor.")