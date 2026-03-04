export default function StoryDisplay({ status, storyText, error, formData, onReset }) {
  const isStreaming = status === 'streaming';
  const isDone = status === 'done';
  const isLoading = status === 'loading';

  // Split story into paragraphs for display
  const paragraphs = storyText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const heroName = formData?.name ?? '';
  const firstChar = formData?.characters?.split(',')[0]?.trim() ?? '';

  return (
    <div className="story-view fade-in">
      {/* Loading dots */}
      {isLoading && (
        <div className="story-status">
          <div className="status-label">The stars are writing your story</div>
          <div className="status-dots">
            <div className="status-dot" />
            <div className="status-dot" />
            <div className="status-dot" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-box">{error}</div>
      )}

      {/* Story card — shown once text starts arriving */}
      {(storyText || isDone) && (
        <div className="story-card">
          <div className="story-title">
            {heroName} and the {firstChar}
          </div>

          <div className="story-body">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            {/* Blinking cursor while streaming */}
            {isStreaming && <span className="story-cursor" aria-hidden="true" />}
          </div>
        </div>
      )}

      {/* Back button — shown when done or errored */}
      {(isDone || error) && (
        <button className="back-btn" onClick={onReset}>
          ✦ &nbsp; Tell another story
        </button>
      )}
    </div>
  );
}
