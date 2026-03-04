import { useState } from 'react';
import Starfield from './components/Starfield.jsx';
import StoryForm from './components/StoryForm.jsx';
import StoryDisplay from './components/StoryDisplay.jsx';
import { useStoryStream } from './hooks/useStoryStream.js';

export default function App() {
  const { status, storyText, error, generate, reset } = useStoryStream();
  const [formData, setFormData] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const showStory = status !== 'idle';
  const isLoading = status === 'loading';

  const handleGenerate = (data) => {
    setFormData(data);
    generate(data);
  };

  // Check mock mode on mount
  useState(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setIsMock(d.mock))
      .catch(() => {});
  });

  return (
    <>
      <Starfield />

      <div className="app-content">
        <header className="site-header">
          <div className="eyebrow">✦ &nbsp; A bedtime story for &nbsp; ✦</div>
          <h1>
            Baby<br />
            <em>Bedtime</em><br />
            Teller
          </h1>
          <p className="tagline">where every child becomes the hero</p>
        </header>

        {/* Hero name glow — shown while filling form */}
        {!showStory && formData?.name && (
          <div className="hero-name visible">
            Tonight&apos;s hero: {formData.name}
          </div>
        )}

        {!showStory ? (
          <StoryForm onGenerate={handleGenerate} isLoading={isLoading} />
        ) : (
          <StoryDisplay
            status={status}
            storyText={storyText}
            error={error}
            formData={formData}
            onReset={reset}
          />
        )}
      </div>

      {isMock && (
        <div className="mock-badge">🎭 mock mode</div>
      )}
    </>
  );
}
