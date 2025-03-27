import os
import numpy as np
import librosa
import tensorflow as tf
import yt_dlp
from pydub import AudioSegment
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model

def download_audio_from_youtube(youtube_url, output_path="audio_temp"):
    """
    Downloads the audio from the YouTube video and converts it to .wav format using yt-dlp.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'extractaudio': True,
        'audioquality': 1,
        'outtmpl': os.path.join(output_path, 'audio.%(ext)s'),  # Output filename template
        'postprocessors': [{
            'key': 'FFmpegAudio',
            'preferredcodec': 'wav',  # Convert to wav
            'preferredquality': '192',
        }],
    }

    # Download the audio from YouTube
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    print(f"Audio downloaded and converted to WAV format at {output_path}/audio.wav")

def extract_features_from_audio(audio_file):
    """
    Extract MFCC features from the audio file.
    """
    y, sr = librosa.load(audio_file, sr=None)  # Load audio file
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)  # Extract MFCC features
    mfcc = np.mean(mfcc, axis=1)  # Take the mean across time frames
    return mfcc

def preprocess_features(features, scaler):
    """
    Scale features using the pre-trained scaler.
    """
    features = features.reshape(1, -1)  # Reshape to match the input format
    return scaler.transform(features)

def classify_audio(model, audio_features):
    """
    Classify the audio as real or fake using the pre-trained model.
    """
    prediction = model.predict(audio_features)
    return "REAL" if prediction[0] > 0.5 else "FAKE"

def process_video(youtube_url, model, scaler):
    """
    Download and process the YouTube video, then classify the audio as real or fake.
    """
    # Download and extract audio
    download_audio_from_youtube(youtube_url)

    # Extract features from the audio
    features = extract_features_from_audio("audio_temp/audio.wav")
    
    # Preprocess the features and classify
    features_scaled = preprocess_features(features, scaler)
    prediction = classify_audio(model, features_scaled)

    print(f"The audio in the video is: {prediction}")

# Main execution function
if __name__ == "__main__":
    # Load your trained model
    model = load_model('news verification/vansh/audio_model.h5')

    # Assuming scaler is saved during training, you can load the scaler here if saved
    # scaler = joblib.load('scaler.pkl')  # Example if you saved the scaler

    # For the purpose of this example, the scaler needs to be generated similarly
    # Here's a basic mock scaler
    scaler = StandardScaler()

    # Example: Process a YouTube video link
    youtube_url = input("Enter YouTube video URL: ")
    process_video(youtube_url, model, scaler)
