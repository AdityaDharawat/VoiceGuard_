import os
import yt_dlp
import whisper
from pydub import AudioSegment
import numpy as np
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model


# Step 1: Download audio from YouTube
def download_audio_from_youtube(youtube_url, output_path="audio_temp"):
    """
    Downloads audio from YouTube and saves it in the specified folder.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'extractaudio': True,
        'audioquality': 1,
        'outtmpl': os.path.join(output_path, 'audio.%(ext)s'),  # Output filename template
        'postprocessors': [{
            'key': 'FFmpegAudio',
            'preferredcodec': 'mp3',  # Convert to mp3
            'preferredquality': '192',
        }],
    }

    # Download the audio from YouTube
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    print(f"Audio downloaded to {output_path}/audio.mp3")
    return os.path.join(output_path, 'audio.mp3')


# Step 2: Transcribe audio using Whisper
def transcribe_audio_with_whisper(audio_path):
    """
    Transcribe audio to text using the Whisper model.
    """
    model = whisper.load_model("base")  # You can change model size (base, small, large) based on resources
    result = model.transcribe(audio_path)
    return result['text']


# Step 3: Extract features from the transcription (simple example using word count)
def extract_features_from_transcription(transcription):
    """
    Extracts features (for simplicity, just using word count).
    This can be enhanced with more complex feature extraction.
    """
    return np.array([len(transcription.split())])  # Using word count as a feature


# Step 4: Preprocess features using a StandardScaler
def preprocess_features(features, scaler):
    """
    Scale features using the pre-trained scaler.
    """
    features = features.reshape(1, -1)  # Reshape to match the input format
    return scaler.transform(features)


# Step 5: Classify audio as real or fake based on features
def classify_audio(model, features):
    """
    Classify the audio as real or fake using the pre-trained model.
    """
    prediction = model.predict(features)
    return "REAL" if prediction[0] > 0.5 else "FAKE"


# Step 6: Process the video (download, transcribe, extract features, and classify)
def process_video(youtube_url, model, scaler):
    """
    Download and process the YouTube video, then classify the audio as real or fake.
    """
    # Download and extract audio
    audio_path = download_audio_from_youtube(youtube_url)

    # Transcribe audio to text using Whisper
    transcription = transcribe_audio_with_whisper(audio_path)
    print(f"Transcription: {transcription}")

    # Extract features from the transcription (using word count as an example feature)
    features = extract_features_from_transcription(transcription)

    # Preprocess the features and classify
    features_scaled = preprocess_features(features, scaler)
    prediction = classify_audio(model, features_scaled)

    print(f"The audio in the video is: {prediction}")


# Main execution function
if __name__ == "__main__":
    # Load your trained classification model
    model = load_model('audio_model.h5')

    # Load your pre-trained scaler (ensure it was saved during training)
    scaler = StandardScaler()  # Replace with joblib.load('scaler.pkl') if scaler is saved as a file

    # Example: Process a YouTube video link
    youtube_url = input("Enter YouTube video URL: ")
    process_video(youtube_url, model, scaler)
    