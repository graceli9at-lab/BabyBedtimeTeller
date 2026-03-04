import { useState, useCallback, useRef } from 'react';

export function useStoryStream() {
  const [status, setStatus] = useState('idle'); // idle | loading | streaming | done | error
  const [storyText, setStoryText] = useState('');
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const generate = useCallback(async (formData) => {
    // Abort any in-flight request before starting a new one
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setStoryText('');
    setError(null);

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setStatus('streaming');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'chunk') {
              setStoryText((prev) => prev + event.text);
            } else if (event.type === 'done') {
              setStatus('done');
            } else if (event.type === 'error') {
              setError(event.message);
              setStatus('error');
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setStatus('idle');
    setStoryText('');
    setError(null);
  }, []);

  return { status, storyText, error, generate, reset };
}
