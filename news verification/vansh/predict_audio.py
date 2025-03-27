import os
import numpy as np
import pandas as pd
import librosa
from tensorflow.keras.models import load_model  # Keras model loading
from sklearn.preprocessing import StandardScaler

def extract_audio_features(audio_path):
    """
    Extract audio features from a single audio file
    """
    # Load audio file
    y, sr = librosa.load(audio_path, duration=3.0, sr=22050)
    
    # Initialize feature dictionary
    features = {}
    
    try:
        # Compute STFT
        stft = librosa.stft(y)
        chroma = librosa.feature.chroma_stft(S=np.abs(stft), sr=sr)
        features['chroma_stft'] = np.mean(chroma)
        
        # Compute RMS energy
        features['rms'] = np.mean(librosa.feature.rms(y=y))
        
        # Compute spectral centroid and bandwidth
        features['spectral_centroid'] = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        features['spectral_bandwidth'] = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
        
        # Compute spectral rolloff
        features['rolloff'] = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
        
        # Compute zero crossing rate
        features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(y))
        
        # Compute MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        for i in range(20):
            features[f'mfcc{i+1}'] = np.mean(mfccs[i])
            
    except Exception as e:
        print(f"Error processing {audio_path}: {str(e)}")
        return None
        
    return features

def predict_audio_class(model, audio_path):
    """
    Extract audio features from the given audio file and predict its class (REAL/FAKE)
    """
    features = extract_audio_features(audio_path)
    
    if features is None:
        print("Failed to extract features from the audio file.")
        return
    
    # Convert features to DataFrame for consistency
    df = pd.DataFrame([features])
    
    # Scale the features using StandardScaler
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(df)
    
    # Make prediction using the trained model
    prediction = model.predict(features_scaled)
    
    # Print the prediction result
    if prediction[0] > 0.5:
        print("The audio is REAL.")
    else:
        print("The audio is FAKE.")

def main():
    # Load the trained Keras model
    try:
        model = load_model("F:/Hackverse Ulhas/Hackverse_NeuralNinjas.py/news verification/vansh/Random Forest.h5")
    except Exception as e:
        print(f"Error loading the Keras model: {e}")
        return
    
    # Ask the user for the path to the audio file
    audio_file_path = input("Please enter the path to the audio file: ")
    
    # Check if the audio file exists
    if not os.path.exists(audio_file_path):
        print(f"Error: The file '{audio_file_path}' does not exist.")
        return
    
    # Predict the class of the input audio
    predict_audio_class(model, audio_file_path)

if __name__ == "__main__":
    main()
