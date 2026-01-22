import React, { useState, useEffect, useRef } from 'react';

const Interface = ({ data, onAnswer, showFeedback }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (!showFeedback) inputRef.current?.focus(); }, [showFeedback]);

  const submit = (e) => {
    e.preventDefault();
    if (input !== '') { onAnswer(); setInput(''); }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '0 auto', color: 'black' }}>
      {!showFeedback ? (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', lineHeight: '1.8' }}>{data.question}</h2>
          <input
            ref={inputRef}
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ background: 'transparent', border: 'none', borderBottom: '0.5px solid black', fontSize: '24px', textAlign: 'center', outline: 'none', paddingBottom: '5px', fontFamily: 'inherit' }}
            placeholder="0"
          />
        </form>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '300' }}>{data.realAnswer}<span style={{ fontSize: '12px', marginLeft: '5px', opacity: 0.5 }}>{data.unit}</span></h2>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>{data.contextText}</p>
        </div>
      )}
    </div>
  );
};

export default Interface;