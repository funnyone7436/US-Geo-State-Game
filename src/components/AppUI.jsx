import React from 'react'

export default function AppUI({ 
  isGameActive, 
  time = 0, 
  statesLeft = 0, 
  capitalsLeft = 0,
  totalStates = 50,
  totalCapitals = 50,
  feedbackText,
  onResetMic // 👈 1. Added the prop here
}) {
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let feedbackColor = '#a0aec0'; 
  if (feedbackText && feedbackText.includes('EXPLORER')) feedbackColor = '#ffd700'; 
  else if (feedbackText && feedbackText.includes('✅')) feedbackColor = '#4caf50'; 
  else if (feedbackText && feedbackText.includes('❌')) feedbackColor = '#f56565'; 

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.8)', 
        color: 'white',
        padding: '12px 18px',
        borderRadius: '12px',
        fontSize: '14px', 
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: !isGameActive && time > 0 ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.2)',
        zIndex: 9999,
        minWidth: '160px',
        backdropFilter: 'blur(4px)'
      }}>
        {/* TIMER */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          color: '#61dafb', 
          fontFamily: 'Courier New, monospace',
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          <span>⏱</span>
          <span>{formatTime(time)}</span>
        </div>

        {/* STATES COUNTDOWN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa' }}>States:</span>
          <span style={{ 
            fontWeight: 'bold', 
            color: statesLeft === 0 ? '#4caf50' : '#fff' 
          }}>
            {statesLeft} / {totalStates}
          </span>
        </div>

        {/* CAPITALS COUNTDOWN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa' }}>Capitals:</span>
          <span style={{ 
            fontWeight: 'bold', 
            color: capitalsLeft === 0 ? '#4caf50' : '#fff' 
          }}>
            {capitalsLeft} / {totalCapitals}
          </span>
        </div>
        
        {/* DYNAMIC STATUS TEXT & RESET BUTTON */}
        {feedbackText && (
          <div style={{ 
            color: feedbackColor, 
            fontWeight: '900',
            textAlign: 'center',
            marginTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '8px',
            fontSize: feedbackText.includes('EXPLORER') ? '16px' : '14px',
            display: 'flex',            // 💡 Use flexbox to easily center the button
            flexDirection: 'column',    // 💡 Stack the text and button vertically
            alignItems: 'center'
          }}>
            <span style={{ marginBottom: '6px' }}>{feedbackText}</span>
            
			{/* 💡 THE RESET BUTTON */}
            {!feedbackText.includes('EXPLORER') && (
              <button 
                onClick={onResetMic}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#aaa',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '12px',          // Slightly bumped up to match
                  cursor: 'pointer',
                  marginTop: '6px',
                  fontFamily: 'inherit',     // 👈 Forces it to use the same font as "Listening..."
                  fontWeight: '900',         // 👈 Matches the thick, bold look of the text!
                  transition: 'all 0.2s ease',
                  pointerEvents: 'auto'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#aaa';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                🔄 Restart Mic
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1000,
          textAlign: 'center',
          pointerEvents: 'none'
      }}>
          <div>
            {feedbackText && feedbackText.includes('EXPLORER')
              ? "Congratulations! 🎉"
              : (!isGameActive && statesLeft === totalStates 
                  ? "🎤 Say any State or Capital to start!" 
                  : "Keep going! Say another one...")}
          </div>
      </div>
    </>
  )
}