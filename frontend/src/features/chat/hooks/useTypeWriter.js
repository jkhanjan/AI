import { useState, useEffect, useRef } from "react";

export function useTypewriter(text, speed) {
  const [displayText, setDisplayText] = useState('');
  const queueRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) {
      return;
    }
    const newChars = text.slice(displayText.length + queueRef.current.length);
    if (newChars) {
      queueRef.current.push(...newChars.split(''));
    }
  }, [text]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, speed);
      setDisplayText((prev) => prev + batch.join(''));
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [speed]);

  useEffect(() => {
    if (!text && queueRef.current.length === 0) {
      setDisplayText('');
    }
  }, [text, displayText]);

  return displayText;
}