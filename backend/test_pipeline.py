import numpy as np
import soundfile as sf
import cv2
import sys
import os

from ml_services import analyze_video_file, analyze_audio_file

def generate_ai_voice(filename="my_ai_voice.wav"):
    # Generate a dummy audio file using a frequency modulated sine wave
    # This simulates a voice with high pitch variation (expressive tone)
    sr = 22050
    duration = 1.0
    t = np.linspace(0, duration, int(sr * duration), False)
    
    carrier_freq = 250
    modulation_freq = 1.5
    modulation_index = 80
    
    # Create the expressive "AI" voice waveform
    audio_signal = np.sin(2 * np.pi * (carrier_freq * t + modulation_index * np.sin(2 * np.pi * modulation_freq * t)))
    
    # Normalize
    audio_signal = audio_signal / np.max(np.abs(audio_signal))
    sf.write(filename, audio_signal, sr)
    print(f"Generated AI Voice sample -> {filename}")
    return filename

def generate_ai_face(filename="my_ai_video.mp4"):
    # Generate a dummy video file
    width, height = 640, 480
    fps = 24
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, fps, (width, height))
    
    for _ in range(fps * 2): # 2 seconds of video
        # Create a digital blue/green visualization representing my AI "face"
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:, :, 1] = np.random.randint(100, 255) # Green
        frame[:, :, 0] = np.random.randint(150, 255) # Blue
        
        cv2.putText(frame, "Antigravity AI Processing", (70, height // 2), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        out.write(frame)
        
    out.release()
    print(f"Generated AI Camera output -> {filename}")
    return filename

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🤖 AI ANTIGRAVITY GENERATING SELF-RECORDING...")
    print("=" * 60)
    
    audio_path = generate_ai_voice()
    video_path = generate_ai_face()
    
    print("\n[ RUNNING MACHINE LEARNING ANALYTICS PIPELINE... ]\n")
    
    # Pass my generated files through your exact Librosa and MediaPipe wrappers!
    facial_feedback = analyze_video_file(video_path)
    audio_msg, audio_score = analyze_audio_file(audio_path)
    
    overall_score = (85.0 + audio_score) / 2
    
    print("+" * 60)
    print("📋 APPLICANT PERFORMANCE REPORT")
    print("+" * 60)
    print(f"Candidate: Antigravity AI")
    print(f"Overall Confidence Score: {overall_score:.2f} / 100")
    print("-" * 60)
    print(f"👁️ Facial Expression Analysis:")
    print(f"   {facial_feedback}")
    print(f"\n🎙️ Vocal Tone & Pitch Analysis:")
    print(f"   {audio_msg}")
    print("+" * 60 + "\n")
