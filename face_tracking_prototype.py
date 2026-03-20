import cv2
import mediapipe as mp
import math

def analyze_face():
    # Initialize MediaPipe Face Detection and Face Mesh
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    
    # Initialize webcam (0 is usually the default laptop camera)
    cap = cv2.VideoCapture(0)
    print("Starting face tracking prototype. Look at the camera and smile!")
    print("Press 'q' to quit.")

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            print("Failed to grab frame from webcam.")
            break

        # Convert the BGR image to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(image_rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Basic Smile Detection (distance between mouth corners)
                # Landmarks 61 and 291 represent the left and right corners of the mouth
                left_mouth = face_landmarks.landmark[61]
                right_mouth = face_landmarks.landmark[291]
                
                # Calculate basic Euclidean distance between mouth corners
                mouth_width = math.sqrt((right_mouth.x - left_mouth.x)**2 + (right_mouth.y - left_mouth.y)**2)
                
                # Determine state based on a basic threshold
                # (Note: In a true app, you'd calculate relative distance based on face size)
                emotion = "Neutral / Focused"
                if mouth_width > 0.12: # Threshold for a smile
                    emotion = "Smiling (Positive/Confident)"

                # Draw text on the screen
                cv2.putText(image, f"Behavior: {emotion}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if "Smiling" in emotion else (0, 165, 255), 2)
                cv2.putText(image, f"Mouth Width: {mouth_width:.2f}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

                # Optional: draw landmarks on the face
                # mp.solutions.drawing_utils.draw_landmarks(image, face_landmarks, mp_face_mesh.FACEMESH_CONTOURS)

        # Show the video feed
        cv2.imshow('Face Tracking & Emotion Analysis Prototype', image)

        # Exit if 'q' is pressed
        if cv2.waitKey(5) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    analyze_face()
