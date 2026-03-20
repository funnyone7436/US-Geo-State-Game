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

    // 1. Tell the UI we are listening
    recognition.onstart = () => {
      onStatusChange("Listening...");
    };

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const spokenPhrase = event.results[last][0].transcript.trim();
      
      // 2. Tell the UI exactly what was heard
      onStatusChange(`Heard: "${spokenPhrase}"`);
      
      onCommandDetected(spokenPhrase.toLowerCase());
    };

    recognition.onend = () => {
      // 3. Tell the UI we dropped connection
      onStatusChange("Connection lost. Re-engaging...");
      setTimeout(startRecognition, 300);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
         // Optionally reset to listening if it just timed out
         onStatusChange("Listening...");
         return;
      }
      
      // 4. Tell the UI about errors
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