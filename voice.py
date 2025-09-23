import speech_recognition as sr
import sounddevice as sd
import vosk
import queue
import json
import requests
import sys
import time
import numpy as np
import noisereduce as nr

# -------------------------
# SETTINGS
# -------------------------
CONFIG = {
    "sample_rate": 16000,
    "silence_timeout": 5.0,  # seconds of silence to stop
    "transcript_file": "transcript.txt",
    "error_log_file": "errors.log",
    "hindi_model_path": "vosk-model-hi-0.22",
    "english_model_path": "vosk-model-en-in-0.5",
}

LANGUAGES = {
    "1": {"code": "hi-IN", "name": "Hindi"},
    "2": {"code": "en-IN", "name": "English"},
    "3": {"code": "mr-IN", "name": "Marathi"},
}

q = queue.Queue()  # Queue for audio frames

# -------------------------
# HELPERS
# -------------------------
def has_internet():
    try:
        requests.get("https://www.google.com", timeout=2)
        return True
    except:
        return False


def choose_language():
    print("\nSelect Language for Conversation:")
    for key, lang in LANGUAGES.items():
        print(f"   {key}. {lang['name']}")
    print("\n[Default recommended: 1 for Hindi]\n")

    while True:
        choice = input("Enter choice (1/2/3): ").strip()
        if choice in LANGUAGES:
            return LANGUAGES[choice]
        else:
            print("Invalid choice. Try again.")


def wait_for_start():
    print("\nHybrid Voice Recognition")
    print("Instructions:")
    print("   • Press ENTER to start listening continuously")
    print("   • Press 'q' + ENTER to quit\n")
    while True:
        user_input = input("Press ENTER to start (or 'q' to quit): ").strip().lower()
        if user_input == "q":
            print("Goodbye!")
            sys.exit(0)
        elif user_input == "":
            return


def save_transcript(text):
    with open(CONFIG["transcript_file"], "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {text}\n")


def log_error(e):
    with open(CONFIG["error_log_file"], "a") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {str(e)}\n")


# -------------------------
# GOOGLE ONLINE RECOGNITION
# -------------------------
def recognize_google_stream(lang):
    """Continuous online recognition using Google API, final text only."""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    with mic as source:
        print("\nAdjusting for ambient noise...")
        recognizer.adjust_for_ambient_noise(source, duration=1)

    print(f"Listening continuously (Google - {lang['name']})...\n")

    session_text = ""
    last_speech_time = time.time()

    try:
        with mic as source:
            while True:
                if time.time() - last_speech_time > CONFIG["silence_timeout"]:
                    if session_text.strip():
                        print(f"\n--- Final Recognized Text ---\n{session_text.strip()}\n")
                        save_transcript(f"{lang['name']}: {session_text.strip()}")
                    print(f"No speech for {CONFIG['silence_timeout']}s → Ending session.\n")
                    break

                try:
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    text = recognizer.recognize_google(audio, language=lang["code"])
                    if text.strip():
                        last_speech_time = time.time()
                        session_text += " " + text.strip()
                except sr.WaitTimeoutError:
                    continue
                except sr.UnknownValueError:
                    continue
                except sr.RequestError as e:
                    print(f"Google error: {e}")
                    log_error(e)
                    break
    except KeyboardInterrupt:
        if session_text.strip():
            print(f"\n--- Final Recognized Text ---\n{session_text.strip()}\n")
            save_transcript(f"{lang['name']}: {session_text.strip()}")
        print("\nStopped by user.")


# -------------------------
# VOSK OFFLINE RECOGNITION
# -------------------------
def callback(indata, frames, time_info, status):
    if status:
        print("Warning:", status)
    audio = np.frombuffer(indata, dtype=np.int16).astype(np.float32)
    audio /= 32768.0
    audio_reduced = nr.reduce_noise(y=audio, sr=CONFIG["sample_rate"])
    audio_int16 = (audio_reduced * 32768).astype(np.int16)
    q.put(audio_int16.reshape(-1, 1))


def recognize_vosk_stream(model_path):
    """Offline recognition, final text only, silence or manual stop ends session."""
    print("\nLoading Vosk Model (may take a few seconds)...\n")
    model = vosk.Model(model_path)
    rec = vosk.KaldiRecognizer(model, CONFIG["sample_rate"])

    print("Model loaded successfully. Listening offline...\n")

    session_text = ""
    last_speech_time = time.time()

    with sd.RawInputStream(samplerate=CONFIG["sample_rate"], blocksize=8000,
                           dtype="int16", channels=1, callback=callback):
        try:
            while True:
                if time.time() - last_speech_time > CONFIG["silence_timeout"]:
                    if session_text.strip():
                        print(f"\n--- Final Recognized Text ---\n{session_text.strip()}\n")
                        save_transcript(session_text.strip())
                    print(f"No speech for {CONFIG['silence_timeout']}s → Ending session.\n")
                    break

                try:
                    data = q.get(timeout=0.1).tobytes()
                except queue.Empty:
                    continue

                if data:
                    if rec.AcceptWaveform(data):
                        result = json.loads(rec.Result())
                        text = result.get("text", "").strip()
                        if text:
                            last_speech_time = time.time()
                            session_text += " " + text
                    else:
                        if rec.PartialResult():
                            last_speech_time = time.time()
        except KeyboardInterrupt:
            if session_text.strip():
                print(f"\n--- Final Recognized Text ---\n{session_text.strip()}\n")
                save_transcript(session_text.strip())
            print("\nStopped by user.")


# -------------------------
# MAIN
# -------------------------
def main():
    while True:
        wait_for_start()
        lang = choose_language()

        if has_internet():
            recognize_google_stream(lang)
        else:
            print("No Internet → Using Offline Vosk")
            model_path = CONFIG["hindi_model_path"] if lang["code"] == "hi-IN" else CONFIG["english_model_path"]
            recognize_vosk_stream(model_path)

        again = input("\nPress ENTER for new session or 'q' to quit: ").strip().lower()
        if again == "q":
            print("Goodbye!")
            break


if __name__ == "__main__":
    main()
