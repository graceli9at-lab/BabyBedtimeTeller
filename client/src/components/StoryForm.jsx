import { useState } from 'react';

const LENGTHS = ['short', 'medium', 'long'];

export default function StoryForm({ onGenerate, isLoading }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [characters, setCharacters] = useState('');
  const [length, setLength] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !characters.trim()) return;
    onGenerate({ name: name.trim(), age, characters: characters.trim(), length });
  };

  const changeAge = (delta) =>
    setAge((prev) => Math.min(10, Math.max(1, prev + delta)));

  return (
    <form onSubmit={handleSubmit} className="card fade-in" noValidate>
      {/* Name */}
      <div className="field">
        <label className="field-label" htmlFor="child-name">
          Who is tonight&apos;s hero?
        </label>
        <input
          id="child-name"
          className="field-input"
          type="text"
          placeholder="Your child's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
      </div>

      {/* Age */}
      <div className="field">
        <span className="field-label">How old?</span>
        <div className="age-stepper">
          <button type="button" className="stepper-btn" onClick={() => changeAge(-1)}>−</button>
          <div className="age-value">{age}</div>
          <button type="button" className="stepper-btn" onClick={() => changeAge(1)}>+</button>
        </div>
      </div>

      {/* Characters */}
      <div className="field">
        <label className="field-label" htmlFor="characters">
          Magic ingredients
        </label>
        <input
          id="characters"
          className="field-input"
          type="text"
          placeholder="e.g. a dragon, the moon, dinosaurs…"
          value={characters}
          onChange={(e) => setCharacters(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      {/* Length */}
      <div className="field">
        <span className="field-label">Story length</span>
        <div className="length-tabs">
          {LENGTHS.map((l) => (
            <button
              key={l}
              type="button"
              className={`length-tab${length === l ? ' active' : ''}`}
              onClick={() => setLength(l)}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="generate-btn"
        disabled={isLoading || !name.trim() || !characters.trim()}
      >
        ✦ Begin the Adventure ✦
      </button>
    </form>
  );
}
