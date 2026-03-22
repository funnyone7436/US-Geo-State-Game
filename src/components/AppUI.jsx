import React, { useState } from 'react'

export default function AppUI({ 
  isGameActive, 
  time = 0, 
  statesCount = 0, 
  capitalsCount = 0,
  totalStates = 50,
  totalCapitals = 50,
  feedbackText,
  gameMode,           
  onToggleMode,       
  onResetMic,
  // 💡 New Props for calculating the list
  remainingItems,
  allStates,
  allCapitals
}) {
  
  // 💡 STATE: Track if the list panel is visible
  const [showMissingList, setShowMissingList] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let feedbackColor = '#a0aec0'; 
  if (feedbackText && feedbackText.includes('EXPLORER')) feedbackColor = '#ffd700'; 
  else if (feedbackText && feedbackText.includes('✅')) feedbackColor = '#4caf50'; 
  else if (feedbackText && feedbackText.includes('❌')) feedbackColor = '#f56565'; 

  // Check if we are at the start of the game based on the mode
  const isAtStart = gameMode === 'erase' ? statesCount === totalStates : statesCount === 0;

  // 💡 New function: Calculate missing States and Capitals not in found basket
  const getMissingItemsList = () => {
    const missingStates = allStates.filter(state => !remainingItems.has(state)).sort();
    const missingCapitals = allCapitals.filter(cap => !remainingItems.has(cap)).sort();
    return { missingStates, missingCapitals };
  };

  const { missingStates, missingCapitals } = getMissingItemsList();
  const totalMissingCount = missingStates.length + missingCapitals.length;

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
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto' // Make sure children are clickable
      }}>
        
        {/* PLAY STYLE TOGGLE BUTTON */}
        <button 
            onClick={onToggleMode}
            style={{
                background: 'rgba(255,215,0,0.2)',
                border: '1px solid #ffd700',
                color: '#ffd700',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                marginBottom: '10px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,215,0,0.4)';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,215,0,0.2)';
              e.target.style.color = '#ffd700';
            }}
        >
            Play Style: {gameMode.toUpperCase()} 🔄
        </button>

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

        {/* STATES COUNT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa' }}>States:</span>
          <span style={{ 
            fontWeight: 'bold', 
            // Turn green when goal is reached for that mode
            color: statesCount === (gameMode === 'erase' ? 0 : totalStates) ? '#4caf50' : '#fff' 
          }}>
            {statesCount} / {totalStates}
          </span>
        </div>

        {/* CAPITALS COUNT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa' }}>Capitals:</span>
          <span style={{ 
            fontWeight: 'bold', 
            color: capitalsCount === (gameMode === 'erase' ? 0 : totalCapitals) ? '#4caf50' : '#fff' 
          }}>
            {capitalsCount} / {totalCapitals}
          </span>
        </div>
        
        {/* 💡 NEW: MISSING LIST BUTTON (only in Populate mode) */}
        {gameMode === 'populate' && (
          <button 
            onClick={() => setShowMissingList(prev => !prev)}
            style={{
              background: showMissingList ? 'rgba(97, 218, 251, 0.3)' : 'rgba(255,255,255,0.1)',
              border: showMissingList ? '1px solid #61dafb' : '1px solid rgba(255,255,255,0.2)',
              color: showMissingList ? '#fff' : '#aaa',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              if (!showMissingList) {
                e.target.style.color = '#fff';
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }
            }}
            onMouseOut={(e) => {
              if (!showMissingList) {
                e.target.style.color = '#aaa';
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
          >
            📋 {showMissingList ? "Hide List" : `Show Missing (${totalMissingCount})`}
          </button>
        )}

        {/* 💡 NEW: SCROLLING MISSING LIST PANEL (appears below everything in Populate mode) */}
        {showMissingList && gameMode === 'populate' && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            maxHeight: '300px', // Limits height and makes it scroll
            overflowY: 'auto',   // Adds the scrollbar
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            border: '1px dashed rgba(255,255,255,0.3)',
            fontSize: '12px',
            color: '#ccc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* MISSING STATES */}
            {missingStates.length > 0 && (
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff', textDecoration: 'underline', marginBottom: '4px'}}>Missing States</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px'}}>
                  {missingStates.map(state => <span key={state}>• {state}</span>)}
                </div>
              </div>
            )}
            
            {/* MISSING CAPITALS */}
            {missingCapitals.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#fff', textDecoration: 'underline', marginBottom: '4px'}}>Missing Capitals</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px'}}>
                  {missingCapitals.map(cap => <span key={cap}>• {cap}</span>)}
                </div>
              </div>
            )}

            {totalMissingCount === 0 && (
              <div style={{ textAlign: 'center', color: '#4caf50', fontStyle: 'italic', padding: '10px 0'}}>
                ✨ All items found! ✨
              </div>
            )}
          </div>
        )}

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
            display: 'flex',            
            flexDirection: 'column',    
            alignItems: 'center'
          }}>
            <span style={{ marginBottom: '6px' }}>{feedbackText}</span>
            
            {!feedbackText.includes('EXPLORER') && (
              <button 
                onClick={onResetMic}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#aaa',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '12px',         
                  cursor: 'pointer',
                  marginTop: '6px',
                  fontFamily: 'inherit',     
                  fontWeight: '900',         
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
            {/* CONGRATULATIONS LOGIC */}
            {feedbackText && feedbackText.includes('EXPLORER')
              ? "Congratulations! 🎉"
              : (!isGameActive && isAtStart 
                  ? "🎤 Say any State or Capital to start!" 
                  : "Keep going! Say another one...")}
          </div>
      </div>
    </>
  )
}