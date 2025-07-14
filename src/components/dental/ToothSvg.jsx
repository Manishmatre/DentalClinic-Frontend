import React from 'react';

/**
 * ToothSvg component for rendering an anatomically accurate tooth SVG
 * @param {string|number} toothNumber Number or letter of the tooth
 * @param {string} toothType Type of tooth (molar, premolar, canine, incisor)
 * @param {string} condition Condition of the tooth (healthy, caries, filled, etc.)
 * @param {array} surfaces Array of affected surfaces
 * @param {boolean} selected Whether the tooth is selected
 * @param {function} onClick Click handler
 */
const ToothSvg = ({ toothNumber, toothType, condition, surfaces = [], selected = false, onClick }) => {
  // Define colors for different conditions
  const conditionColors = {
    healthy: '#ffffff',
    caries: '#ffcc00',
    filled: '#a0a0a0',
    missing: '#f0f0f0',
    crown: '#c0c0ff',
    bridge: '#c0e0ff',
    implant: '#c0ffc0',
    rootCanal: '#ffc0c0',
    extraction: '#ff0000',
    sealant: '#e0ffe0',
    veneer: '#ffe0c0',
  };

  // Get base color from condition
  const baseColor = conditionColors[condition] || conditionColors.healthy;
  
  // Determine if a surface is affected
  const isSurfaceAffected = (surface) => surfaces.includes(surface);

  // Check if the tooth number is a letter (primary tooth)
  const isPrimaryTooth = typeof toothNumber === 'string' && /^[A-T]$/.test(toothNumber);

  // Get SVG path based on tooth type
  const getToothPath = () => {
    // Adjust paths for primary teeth (make them slightly smaller)
    const scale = isPrimaryTooth ? 0.85 : 1;
    
    switch(toothType) {
      case 'molar':
        return `M${2*scale},${2*scale} L${18*scale},${2*scale} L${18*scale},${18*scale} L${2*scale},${18*scale} Z`;
      case 'premolar':
        return `M${4*scale},${2*scale} L${16*scale},${2*scale} L${16*scale},${18*scale} L${4*scale},${18*scale} Z`;
      case 'canine':
        // More pointed for canines
        return `M${5*scale},${2*scale} L${15*scale},${2*scale} L${15*scale},${18*scale} L${5*scale},${18*scale} Z`;
      case 'incisor':
        // Flatter for incisors
        return `M${6*scale},${2*scale} L${14*scale},${2*scale} L${14*scale},${18*scale} L${6*scale},${18*scale} Z`;
      default:
        return `M${2*scale},${2*scale} L${18*scale},${2*scale} L${18*scale},${18*scale} L${2*scale},${18*scale} Z`; // Default to molar
    }
  };

  // Format tooth number display based on numbering system
  const formatToothNumber = () => {
    // If it's an FDI number (two digits), format it as quadrant.tooth
    if (typeof toothNumber === 'number' && toothNumber >= 11 && toothNumber <= 85) {
      const quadrant = Math.floor(toothNumber / 10);
      const position = toothNumber % 10;
      if ([1, 2, 3, 4, 5, 6, 7, 8].includes(quadrant) && position > 0) {
        return toothNumber;
      }
    }
    
    // Otherwise just return as is
    return toothNumber;
  };

  return (
    <div 
      className={`tooth-svg ${selected ? 'selected' : ''} ${condition === 'missing' ? 'missing' : ''}`} 
      onClick={onClick}
      style={{
        position: 'relative',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        border: selected ? '2px solid #4299e1' : '1px solid #e2e8f0',
        borderRadius: '4px',
        backgroundColor: condition === 'missing' ? '#f0f0f0' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px',
      }}
    >
      {/* Tooth Number */}
      <div className="tooth-number" style={{ 
        fontSize: '10px', 
        fontWeight: 'bold',
        color: isPrimaryTooth ? '#0066cc' : '#333333' // Blue for primary teeth
      }}>
        {formatToothNumber()}
      </div>
      
      {/* SVG Tooth */}
      <svg width="40" height="40" viewBox="0 0 20 20">
        {/* Base tooth shape */}
        <path 
          d={getToothPath()} 
          fill={baseColor} 
          stroke="#666" 
          strokeWidth="0.5"
        />
        
        {/* Surfaces */}
        {/* Mesial (front) */}
        <rect 
          x={isPrimaryTooth ? 3 : 2} 
          y={isPrimaryTooth ? 3 : 2} 
          width={isPrimaryTooth ? 14 : 16} 
          height={isPrimaryTooth ? 3 : 4} 
          fill={isSurfaceAffected('mesial') ? '#ff6666' : 'transparent'} 
          stroke={isSurfaceAffected('mesial') ? '#ff0000' : 'transparent'} 
          strokeWidth="0.5"
        />
        
        {/* Distal (back) */}
        <rect 
          x={isPrimaryTooth ? 3 : 2} 
          y={isPrimaryTooth ? 14 : 14} 
          width={isPrimaryTooth ? 14 : 16} 
          height={isPrimaryTooth ? 3 : 4} 
          fill={isSurfaceAffected('distal') ? '#ff6666' : 'transparent'} 
          stroke={isSurfaceAffected('distal') ? '#ff0000' : 'transparent'} 
          strokeWidth="0.5"
        />
        
        {/* Buccal (outer) */}
        <rect 
          x={isPrimaryTooth ? 3 : 2} 
          y={isPrimaryTooth ? 6 : 6} 
          width={isPrimaryTooth ? 3 : 4} 
          height={isPrimaryTooth ? 8 : 8} 
          fill={isSurfaceAffected('buccal') ? '#ff6666' : 'transparent'} 
          stroke={isSurfaceAffected('buccal') ? '#ff0000' : 'transparent'} 
          strokeWidth="0.5"
        />
        
        {/* Lingual (inner) */}
        <rect 
          x={isPrimaryTooth ? 14 : 14} 
          y={isPrimaryTooth ? 6 : 6} 
          width={isPrimaryTooth ? 3 : 4} 
          height={isPrimaryTooth ? 8 : 8} 
          fill={isSurfaceAffected('lingual') ? '#ff6666' : 'transparent'} 
          stroke={isSurfaceAffected('lingual') ? '#ff0000' : 'transparent'} 
          strokeWidth="0.5"
        />
        
        {/* Occlusal (top) */}
        <rect 
          x={isPrimaryTooth ? 6 : 6} 
          y={isPrimaryTooth ? 6 : 6} 
          width={isPrimaryTooth ? 8 : 8} 
          height={isPrimaryTooth ? 8 : 8} 
          fill={isSurfaceAffected('occlusal') ? '#ff6666' : 'transparent'} 
          stroke={isSurfaceAffected('occlusal') ? '#ff0000' : 'transparent'} 
          strokeWidth="0.5"
        />
        
        {/* Special indicator for missing teeth */}
        {condition === 'missing' && (
          <g>
            <line x1="2" y1="2" x2="18" y2="18" stroke="#ff0000" strokeWidth="1" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#ff0000" strokeWidth="1" />
          </g>
        )}
        
        {/* Special indicator for implants */}
        {condition === 'implant' && (
          <circle cx="10" cy="10" r="3" fill="none" stroke="#00aa00" strokeWidth="1" />
        )}
        
        {/* Special indicator for root canal */}
        {condition === 'rootCanal' && (
          <line x1="10" y1="5" x2="10" y2="15" stroke="#ff0000" strokeWidth="1" />
        )}
      </svg>
    </div>
  );
};

export default ToothSvg;
