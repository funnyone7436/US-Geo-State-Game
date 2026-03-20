import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

/**
 * 🛠 FULL CONFIGURATION LIST
 * Use the 'offset' [x, y, z] to nudge labels that overlap.
 * Positive Y moves text UP, Negative Y moves text DOWN.
 */
const LABEL_CONFIG = {
  // --- STATES (Default size: 95px) ---
  "Alabama": { offset: [-1, -.5, 0], size: '90px' },
  "Alaska": { offset: [0, 0, 0], size: '95px' },
  "Arizona": { offset: [0, 1, 0], size: '95px' },
  "Arkansas": { offset: [0, 0, 0], size: '95px' },
  "California": { offset: [0, -5, 0], size: '95px' }, // Kept your specific nudge
  "Colorado": { offset: [0, -2, 0], size: '95px' },
  "Connecticut": { offset: [-0.6, -1.4, 0], size: '60px' },
  "Delaware": { offset: [-3.6, -0.8, 0], size: '80px' },
  "Florida": { offset: [0, 0, 0], size: '95px' },
  "Georgia": { offset: [0, -0.5, 0], size: '95px' },
  "Hawaii": { offset: [0, 0, 0], size: '95px' },
  "Idaho": { offset: [0, 0, 0], size: '95px' },
  "Illinois": { offset: [1, 0.2, 0], size: '90px' },
  "Indiana": { offset: [-1, -2, 0], size: '70px' },
  "Iowa": { offset: [0, 0, 0], size: '95px' },
  "Kansas": { offset: [0, -2, 0], size: '95px' },
  "Kentucky": { offset: [0, -2, 0], size: '95px' },
  "Louisiana": { offset: [0, -1, 0], size: '95px' },
  "Maine": { offset: [-2, -1, 0], size: '95px' },
  "Maryland": { offset: [-4, -2.4, 0], size: '70px' },
  "Massachusetts": { offset: [-5.6, 0.8, 0], size: '70px' },
  "Michigan": { offset: [-2, -3, 0], size: '90px' },
  "Minnesota": { offset: [0, 0, 0], size: '95px' },
  "Mississippi": { offset: [1, -1, 0], size: '85px' },
  "Missouri": { offset: [1, 0.6, 0], size: '95px' },
  "Montana": { offset: [-1, 1, 0], size: '95px' },
  "Nebraska": { offset: [0, 0, 0], size: '95px' },
  "Nevada": { offset: [0, 0, 0], size: '95px' },
  "New Hampshire": { offset: [-5, -0.5, 0], size: '75px' },
  "New Jersey": { offset: [-4, -1., 0], size: '80px' },
  "New Mexico": { offset: [0, -1, 0], size: '95px' },
  "New York": { offset: [0.6, 0, 0], size: '75px' },
  "North Carolina": { offset: [-1, -1.5, 0], size: '95px' },
  "North Dakota": { offset: [1, -1, 0], size: '98px' },
  "Ohio": { offset: [0, 0.6, 0], size: '90px' },
  "Oklahoma": { offset: [0, 0, 0], size: '95px' },
  "Oregon": { offset: [0, -2, 0], size: '95px' },
  "Pennsylvania": { offset: [0, -.8, 0], size: '80px' },
  "Rhode Island": { offset: [-2, -0.6, 0], size: '50px' },
  "South Carolina": { offset: [-3, -1.2, 0], size: '90px' },
  "South Dakota": { offset: [0, 1, 0], size: '95px' },
  "Tennessee": { offset: [1, -2.2, 0], size: '95px' },
  "Texas": { offset: [0, 0, 0], size: '95px' },
  "Utah": { offset: [0, 0, 0], size: '95px' },
  "Vermont": { offset: [1, 1, 0], size: '65px' },
  "Virginia": { offset: [-1, -2.4, 0], size: '85px' },
  "Washington": { offset: [0, -2.5, 0], size: '95px' },
  "West Virginia": { offset: [0, -.8, 0], size: '85px' },
  "Wisconsin": { offset: [0, 0, 0], size: '90px' },
  "Wyoming": { offset: [0, 0, 0], size: '95px' },

  // --- CAPITALS (Default size: 85px) ---
"Washington Dc": { offset: [-2, 3, 1], size: '75px' },
  "Washington DC": { offset: [-2, 3, 1], size: '75px' },
  "Washington_DC": { offset: [-2, 3, 1], size: '75px' },
  "Montgomery": { offset: [-2, -2, 0], size: '76px' },
  "Juneau": { offset: [0, 0, 0], size: '85px' },
  "Phoenix": { offset: [0, 0, 0], size: '85px' },
  "Little Rock": { offset: [0, -2.4, 0], size: '80px' },
  "Sacramento": { offset: [2, -1.5, 0.5], size: '85px' }, // Kept your specific nudge
  "Denver": { offset: [0, 0, 0], size: '85px' },
  "Hartford": { offset: [1, -0.6, 0], size: '55px' },
  "Dover": { offset: [-2, 0, 0], size: '70px' },
  "Tallahassee": { offset: [0, -2, 0], size: '85px' },
  "Atlanta": { offset: [0, 0, 0], size: '85px' },
  "Honolulu": { offset: [0, 0, 0], size: '85px' },
  "Boise": { offset: [0, 0, 0], size: '85px' },
  "Springfield": { offset: [0, -2, 0], size: '70px' },
  "Indianapolis": { offset: [0, 0, 0], size: '70px' },
  "Des Moines": { offset: [-2, -1, 0], size: '85px' },
  "Topeka": { offset: [3, -1, 0], size: '85px' },
  "Frankfort": { offset: [0, -1.6, 0], size: '85px' },
  "Baton Rouge": { offset: [0, -2, 0], size: '85px' },
  "Augusta": { offset: [-3.6, -0.6, 0], size: '85px' },
  "Annapolis": { offset: [-2.4, -1.6, 0], size: '70px' },
  "Boston": { offset: [1.6, -1.2, 0], size: '55px' },
  "Lansing": { offset: [0, 0, 0], size: '85px' },
  "St. Paul": { offset: [1, -2, 0], size: '85px' },
  "Jackson": { offset: [0, -2, 0], size: '80px' },
  "Jefferson City": { offset: [0, -2, 0], size: '80px' },
  "Helena": { offset: [0, 0, 0], size: '85px' },
  "Lincoln": { offset: [0, 0, 0], size: '85px' },
  "Carson City": { offset: [-2, 0, 0], size: '80px' },
  "Concord": { offset: [-1.5, -1.2, 0], size: '55px' },
  "Trenton": { offset: [-1, -0.4, 0], size: '60px' },
  "Santa Fe": { offset: [0, 0, 0], size: '85px' },
  "Albany": { offset: [3.6, -1.6, 0], size: '65px' },
  "Raleigh": { offset: [0, -0.5, 0], size: '80px' },
  "Bismarck": { offset: [0, -2.4, 0], size: '85px' },
  "Columbus": { offset: [-1.5, 0.4, 0], size: '70px' },
  "Oklahoma City": { offset: [-1, -2, 0], size: '85px' },
  "Salem": { offset: [0, 0, 0], size: '85px' },
  "Harrisburg": { offset: [1, -1.6, 0], size: '70px' },
  "Providence": { offset: [-2.4, -0.2, 0], size: '55px' },
  "Columbia": { offset: [0, 0, 0], size: '85px' },
  "Pierre": { offset: [0, -2, 0], size: '85px' },
  "Nashville": { offset: [0, -1.6, 0], size: '85px' },
  "Austin": { offset: [0, 0, 0], size: '85px' },
  "Salt Lake City": { offset: [0, 0, 0], size: '85px' },
  "Montpelier": { offset: [1.2, -2.4, 0], size: '55px' },
  "Richmond": { offset: [-3.6, -0.6, 0], size: '70px' },
  "Olympia": { offset: [0, 0, 0], size: '85px' },
  "Charleston": { offset: [-1.6, -1, 0], size: '70px' },
  "Madison": { offset: [0, 0, 0], size: '85px' },
  "Cheyenne": { offset: [0, 0, 0], size: '85px' },
};

export default function StateLabels({ obj, remainingItems, targetRegion, setTargetRegion, usStatesList }) {
  const meshCenters = useMemo(() => {
    const centers = {};
    obj.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        child.geometry.boundingBox.getCenter(center);
        centers[child.name] = center;
      }
    });
    return centers;
  }, [obj]);

return (
    <>
	{Object.entries(meshCenters).map(([name, center], index) => {
			const displayName = name.replace(/_/g, ' ');
			const config = LABEL_CONFIG[displayName];
			
			// 1. RELIABLE LOGIC: Use the actual list of States passed as a prop
			const isState = usStatesList?.includes(displayName);

        // 2. FIXED COLORS: Capitals (isState = false) MUST be black
        const textColor = isState ? '#000000' : '#00f000'; 
        // Use a white stroke on black text so it doesn't disappear on dark map colors
        const strokeColor = isState ? '#ff0000' : '#ffffff'; 
		
		const handleLabelClick = (e) => {
		  e.stopPropagation(); // Prevents the click from "bleeding" through to the map
		  console.log("Label clicked:", name);
		  setTargetRegion(name); // 'name' is the original mesh name (e.g., 'New_York')
		};

        if (remainingItems?.has(displayName)) {
          return (
            <Html
              key={`${name}-${index}`}
              position={[
                center.x + (config?.offset[0] || 0), 
                center.y + 1.2 + (config?.offset[1] || 0), 
                center.z + (config?.offset[2] || 0)
              ]} 
              center
              distanceFactor={8} 
			  zIndexRange={[0, 10]} // Keeps 3D labels in a low Z-space
              portal={undefined}      // Ensures it stays within the canvas container
            >
              <div 
				onClick={handleLabelClick}			  
				style={{
                cursor: 'pointer',        // Add this to show it is clickable
				pointerEvents: 'auto',    // CHANGE THIS from 'none' to 'auto'
                background: 'transparent',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                fontWeight: '900',
                fontFamily: 'Arial Black, sans-serif',
                WebkitTextStroke: `1.2px ${strokeColor}`, 
                textShadow: isState ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
              }}>
                <div style={{ fontSize: config?.size || '85px', lineHeight: '1' }}>
                  {displayName}
                </div>
              </div>
            </Html>
          );
        }
        return null;
      })}
    </>
  );
}