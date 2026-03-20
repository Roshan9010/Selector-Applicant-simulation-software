import librosa
import numpy as np

def analyze_audio(file_path):
    print(f"Loading audio file: {file_path} ...\n")
    try:
        # Load the audio file (sr=None preserves native sampling rate)
        y, sr = librosa.load(file_path, sr=None)
        
        # 1. Calculate General Audio Duration
        duration = librosa.get_duration(y=y, sr=sr)
        
        # 2. Extract Pitch (Fundamental Frequency - F0)
        # Using the YIN algorithm for pitch tracking - excellent for speech
        print("Extracting pitch variations...")
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y, 
            fmin=librosa.note_to_hz('C2'), # Typical lower bound for human voice
            fmax=librosa.note_to_hz('C7')  # Typical upper bound
        )
        
        # Filter out unvoiced parts/silence (where f0 is NaN)
        valid_f0 = f0[~np.isnan(f0)]
        mean_pitch = np.mean(valid_f0) if len(valid_f0) > 0 else 0
        pitch_variation = np.std(valid_f0) if len(valid_f0) > 0 else 0
        
        # 3. Tone Variations (MFCCs - Mel-frequency cepstral coefficients)
        # These represent the shape of the vocal tract and tone properties
        print("Extracting tonal characteristics (MFCCs)...")
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mean_mfccs = np.mean(mfccs, axis=1)

        # Output Results
        print("-" * 40)
        print("🎙️ APPLICANT VOICE ANALYSIS RESULTS")
        print("-" * 40)
        print(f"Total Duration: {duration:.2f} seconds")
        print(f"Average Pitch (Hz): {mean_pitch:.2f} Hz")
        print(f"Pitch Variation (Std Dev): {pitch_variation:.2f}")
        
        print("\n--- Assessment ---")
        if pitch_variation < 15: # Arbitrary prototype threshold
            print("⚠️ Voice sounds relatively flat or monotonic.")
            print("   ↳ Candidate Feedback: Try to modulate your voice more to show enthusiasm rather than sounding nervous/robotic.")
        else:
            print("✅ Good voice modulation and expressive tone.")
            print("   ↳ Candidate Feedback: Your vocal delivery is varied and indicates confidence.")
            
    except Exception as e:
        print(f"Error loading or analyzing file: {e}")
        print("\nPlease ensure you have:")
        print("1. A valid .wav or .mp3 file named 'sample_interview.wav' in this folder.")
        print("2. Installed librosa via: pip install librosa numpy")

if __name__ == "__main__":
    # Replace 'sample_interview.wav' with an actual file path to test.
    # E.g., record yourself speaking for 10 seconds and save it in the same directory.
    analyze_audio("sample_interview.wav")
