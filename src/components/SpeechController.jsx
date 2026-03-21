import { useEffect, useRef } from 'react'

export default function SpeechController({ onCommandDetected, onStatusChange }) {
  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false);

  const startRecognition = () => {
    if (isStoppingRef.current) return;
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
      recognitionRef.current.start();
    } catch (e) { }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onStatusChange("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // 💡 REMOVED onStatusChange("Listening...") so it stops overwriting your Found messages
    recognition.onstart = () => {};

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const spokenPhrase = event.results[last][0].transcript.trim();
      
      // Let App.jsx handle all the status messages now!
      onCommandDetected(spokenPhrase.toLowerCase());
    };

    recognition.onend = () => {
      // 💡 REMOVED onStatusChange("Connection lost...") 
      // The mic will now silently restart in the background without spamming the UI
      setTimeout(startRecognition, 300);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
         return; // Silently ignore standard timeouts
      }
      
      // Only show actual hard errors
      onStatusChange(`Error: ${event.error}`);
      
      if (event.error === 'network') {
        setTimeout(startRecognition, 1000);
      }
    };

    recognitionRef.current = recognition;
    isStoppingRef.current = false;
    startRecognition();

    return () => {
      isStoppingRef.current = true;
      recognition.stop();
    };
  }, [onCommandDetected, onStatusChange]);

  return null;
}