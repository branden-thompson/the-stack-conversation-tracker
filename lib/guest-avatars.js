/**
 * Guest Avatar Management
 * 
 * Provides a pool of distinctive avatars for guest users
 * Uses geometric patterns and colors for unique, recognizable avatars
 */

// Avatar pool configuration - Monster themes
const AVATAR_COLORS = [
  // Original 12
  { bg: '#FF6B6B', fg: '#FFFFFF', accent: '#FF4757' }, // Red Monster
  { bg: '#4ECDC4', fg: '#FFFFFF', accent: '#00B894' }, // Teal Monster
  { bg: '#45B7D1', fg: '#FFFFFF', accent: '#0984E3' }, // Blue Monster
  { bg: '#96CEB4', fg: '#FFFFFF', accent: '#00B894' }, // Green Monster
  { bg: '#FFEAA7', fg: '#2D3436', accent: '#FDCB6E' }, // Yellow Monster
  { bg: '#DDA0DD', fg: '#FFFFFF', accent: '#A29BFE' }, // Purple Monster
  { bg: '#98D8C8', fg: '#2D3436', accent: '#55EFC4' }, // Mint Monster
  { bg: '#FFB6C1', fg: '#2D3436', accent: '#FD79A8' }, // Pink Monster
  { bg: '#87CEEB', fg: '#2D3436', accent: '#74B9FF' }, // Sky Monster
  { bg: '#F0E68C', fg: '#2D3436', accent: '#FDCB6E' }, // Khaki Monster
  { bg: '#E6E6FA', fg: '#2D3436', accent: '#A29BFE' }, // Lavender Monster
  { bg: '#F4A460', fg: '#FFFFFF', accent: '#E17055' }, // Sandy Monster
  // New additions (18 more = 30 total)
  { bg: '#FF9FF3', fg: '#2D3436', accent: '#EE5A6F' }, // Rose Monster
  { bg: '#54A0FF', fg: '#FFFFFF', accent: '#2E86DE' }, // Ocean Monster
  { bg: '#48DBFB', fg: '#2D3436', accent: '#0ABDE3' }, // Cyan Monster
  { bg: '#1DD1A1', fg: '#FFFFFF', accent: '#10AC84' }, // Emerald Monster
  { bg: '#00D2D3', fg: '#FFFFFF', accent: '#01A3A4' }, // Turquoise Monster
  { bg: '#FFA502', fg: '#2D3436', accent: '#FF6348' }, // Orange Monster
  { bg: '#8E44AD', fg: '#FFFFFF', accent: '#9B59B6' }, // Violet Monster
  { bg: '#E74C3C', fg: '#FFFFFF', accent: '#C0392B' }, // Crimson Monster
  { bg: '#3498DB', fg: '#FFFFFF', accent: '#2980B9' }, // Azure Monster
  { bg: '#2ECC71', fg: '#FFFFFF', accent: '#27AE60' }, // Jade Monster
  { bg: '#F39C12', fg: '#2D3436', accent: '#D68910' }, // Amber Monster
  { bg: '#16A085', fg: '#FFFFFF', accent: '#138D75' }, // Teal Dark Monster
  { bg: '#D35400', fg: '#FFFFFF', accent: '#BA4A00' }, // Rust Monster
  { bg: '#7F8C8D', fg: '#FFFFFF', accent: '#566573' }, // Steel Monster
  { bg: '#BDC3C7', fg: '#2D3436', accent: '#95A5A6' }, // Silver Monster
  { bg: '#F8B500', fg: '#2D3436', accent: '#F79F1F' }, // Gold Monster
  { bg: '#EA8685', fg: '#FFFFFF', accent: '#EC7063' }, // Coral Monster
  { bg: '#BB8FCE', fg: '#FFFFFF', accent: '#AF7AC5' }, // Orchid Monster
];

// Monster face shapes
const MONSTER_SHAPES = [
  // Original 8
  'round',      // Round fluffy monster
  'square',     // Square blocky monster
  'blob',       // Blob monster
  'spiky',      // Spiky monster
  'tall',       // Tall monster
  'wide',       // Wide monster
  'diamond',    // Diamond shaped monster
  'heart',      // Heart shaped monster
  // New additions (7 more = 15 total)
  'triangle',   // Triangle shaped monster
  'pentagon',   // Pentagon shaped monster
  'hexagon',    // Hexagon shaped monster
  'star',       // Star shaped monster
  'cloud',      // Cloud shaped monster
  'egg',        // Egg shaped monster
  'teardrop'    // Teardrop shaped monster
];

// Eye styles for monsters
const EYE_STYLES = [
  // Original 8
  'dots',       // Simple dot eyes
  'circles',    // Round eyes
  'angry',      // Angled angry eyes
  'sleepy',     // Half-closed eyes
  'wide',       // Wide surprised eyes
  'wink',       // One eye winking
  'cyclops',    // Single large eye
  'triple',     // Three eyes
  // New additions (7 more = 15 total)
  'star',       // Star-shaped eyes
  'heart',      // Heart-shaped eyes
  'cross',      // X eyes
  'spiral',     // Spiral eyes
  'square',     // Square eyes
  'diamond',    // Diamond eyes
  'mixed'       // Different eyes (one dot, one circle)
];

// Mouth styles
const MOUTH_STYLES = [
  // Original 8
  'smile',      // Happy smile
  'frown',      // Sad frown
  'open',       // Open mouth
  'teeth',      // Showing teeth
  'tongue',     // Tongue out
  'zigzag',     // Zigzag mouth
  'small',      // Small mouth
  'wide',       // Wide mouth
  // New additions (7 more = 15 total)
  'oval',       // Oval mouth
  'surprised',  // O-shaped surprised
  'wavy',       // Wavy line mouth
  'curved',     // Curved line
  'cat',        // Cat-like w mouth
  'vampire',    // Fangs
  'mustache'    // Mustache shape
];

// Additional features
const FEATURES = [
  // Original 8
  'horns',      // Little horns
  'antenna',    // Antenna
  'spots',      // Spots pattern
  'fur',        // Furry texture
  'scales',     // Scale pattern
  'none',       // No extra features
  'ears',       // Ears
  'spikes',     // Spikes on top
  // New additions (7 more = 15 total)
  'crown',      // Crown on top
  'bow',        // Bow tie
  'glasses',    // Glasses
  'hat',        // Hat
  'wings',      // Small wings
  'tail',       // Tail
  'stripes'     // Stripe pattern
];

/**
 * Generate SVG content for a monster avatar
 */
function generateAvatarSVG(colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const shape = MONSTER_SHAPES[shapeIndex % MONSTER_SHAPES.length];
  const eyeStyle = EYE_STYLES[eyeIndex % EYE_STYLES.length];
  const mouthStyle = MOUTH_STYLES[mouthIndex % MOUTH_STYLES.length];
  const feature = FEATURES[featureIndex % FEATURES.length];
  
  const svgStart = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">`;
  const svgEnd = `</svg>`;
  
  // Background circle
  let background = `<circle cx="50" cy="50" r="48" fill="${color.bg}" stroke="${color.accent}" stroke-width="2"/>`;
  
  // Monster body/face shape
  let monsterBody = '';
  switch(shape) {
    case 'round':
      monsterBody = `<circle cx="50" cy="55" r="35" fill="${color.bg}"/>`;
      break;
    case 'square':
      monsterBody = `<rect x="20" y="25" width="60" height="60" rx="10" fill="${color.bg}"/>`;
      break;
    case 'blob':
      monsterBody = `<ellipse cx="50" cy="55" rx="35" ry="30" fill="${color.bg}"/>`;
      break;
    case 'spiky':
      monsterBody = `<polygon points="50,20 65,35 80,40 70,55 75,70 50,60 25,70 30,55 20,40 35,35" fill="${color.bg}"/>`;
      break;
    case 'tall':
      monsterBody = `<ellipse cx="50" cy="50" rx="25" ry="38" fill="${color.bg}"/>`;
      break;
    case 'wide':
      monsterBody = `<ellipse cx="50" cy="55" rx="38" ry="25" fill="${color.bg}"/>`;
      break;
    case 'diamond':
      monsterBody = `<polygon points="50,20 75,50 50,80 25,50" fill="${color.bg}"/>`;
      break;
    case 'heart':
      monsterBody = `<path d="M50,75 C30,60 15,45 15,35 C15,25 20,20 27,20 C33,20 38,23 50,35 C62,23 67,20 73,20 C80,20 85,25 85,35 C85,45 70,60 50,75" fill="${color.bg}"/>`;
      break;
    case 'triangle':
      monsterBody = `<polygon points="50,20 75,70 25,70" fill="${color.bg}"/>`;
      break;
    case 'pentagon':
      monsterBody = `<polygon points="50,20 73,38 65,65 35,65 27,38" fill="${color.bg}"/>`;
      break;
    case 'hexagon':
      monsterBody = `<polygon points="50,20 70,30 70,50 50,60 30,50 30,30" fill="${color.bg}"/>`;
      break;
    case 'star':
      monsterBody = `<polygon points="50,15 58,35 78,35 62,48 68,68 50,55 32,68 38,48 22,35 42,35" fill="${color.bg}"/>`;
      break;
    case 'cloud':
      monsterBody = `<path d="M35,60 C25,60 20,55 20,47 C20,40 25,35 32,35 C33,28 38,23 45,23 C50,23 55,26 57,30 C60,28 63,27 67,27 C73,27 78,32 78,38 C78,39 78,40 77,41 C80,43 82,46 82,50 C82,56 77,60 70,60 Z" fill="${color.bg}"/>`;
      break;
    case 'egg':
      monsterBody = `<ellipse cx="50" cy="55" rx="28" ry="35" fill="${color.bg}"/>`;
      break;
    case 'teardrop':
      monsterBody = `<path d="M50,20 C65,20 75,30 75,45 C75,55 65,65 50,75 C35,65 25,55 25,45 C25,30 35,20 50,20" fill="${color.bg}"/>`;
      break;
    default:
      monsterBody = `<circle cx="50" cy="55" r="35" fill="${color.bg}"/>`;
  }
  
  // Eyes
  let eyes = '';
  switch(eyeStyle) {
    case 'dots':
      eyes = `
        <circle cx="35" cy="45" r="3" fill="${color.fg}"/>
        <circle cx="65" cy="45" r="3" fill="${color.fg}"/>`;
      break;
    case 'circles':
      eyes = `
        <circle cx="35" cy="45" r="8" fill="white"/>
        <circle cx="35" cy="45" r="5" fill="${color.fg}"/>
        <circle cx="65" cy="45" r="8" fill="white"/>
        <circle cx="65" cy="45" r="5" fill="${color.fg}"/>`;
      break;
    case 'angry':
      eyes = `
        <line x1="30" y1="40" x2="40" y2="45" stroke="${color.fg}" stroke-width="3" stroke-linecap="round"/>
        <line x1="70" y1="40" x2="60" y2="45" stroke="${color.fg}" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'sleepy':
      eyes = `
        <path d="M30,45 Q35,40 40,45" fill="none" stroke="${color.fg}" stroke-width="2"/>
        <path d="M60,45 Q65,40 70,45" fill="none" stroke="${color.fg}" stroke-width="2"/>`;
      break;
    case 'wide':
      eyes = `
        <ellipse cx="35" cy="45" rx="10" ry="12" fill="white"/>
        <circle cx="35" cy="45" r="6" fill="${color.fg}"/>
        <ellipse cx="65" cy="45" rx="10" ry="12" fill="white"/>
        <circle cx="65" cy="45" r="6" fill="${color.fg}"/>`;
      break;
    case 'wink':
      eyes = `
        <circle cx="35" cy="45" r="8" fill="white"/>
        <circle cx="35" cy="45" r="5" fill="${color.fg}"/>
        <path d="M60,45 Q65,48 70,45" fill="none" stroke="${color.fg}" stroke-width="2"/>`;
      break;
    case 'cyclops':
      eyes = `
        <circle cx="50" cy="45" r="15" fill="white"/>
        <circle cx="50" cy="45" r="10" fill="${color.fg}"/>
        <circle cx="52" cy="43" r="3" fill="white"/>`;
      break;
    case 'triple':
      eyes = `
        <circle cx="30" cy="45" r="5" fill="${color.fg}"/>
        <circle cx="50" cy="40" r="5" fill="${color.fg}"/>
        <circle cx="70" cy="45" r="5" fill="${color.fg}"/>`;
      break;
    default:
      eyes = `
        <circle cx="35" cy="45" r="5" fill="${color.fg}"/>
        <circle cx="65" cy="45" r="5" fill="${color.fg}"/>`;
  }
  
  // Mouth
  let mouth = '';
  switch(mouthStyle) {
    case 'smile':
      mouth = `<path d="M35,60 Q50,70 65,60" fill="none" stroke="${color.fg}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case 'frown':
      mouth = `<path d="M35,65 Q50,55 65,65" fill="none" stroke="${color.fg}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case 'open':
      mouth = `<ellipse cx="50" cy="65" rx="12" ry="8" fill="${color.fg}"/>`;
      break;
    case 'teeth':
      mouth = `
        <rect x="38" y="60" width="24" height="10" fill="${color.fg}"/>
        <line x1="44" y1="60" x2="44" y2="70" stroke="${color.bg}" stroke-width="1"/>
        <line x1="50" y1="60" x2="50" y2="70" stroke="${color.bg}" stroke-width="1"/>
        <line x1="56" y1="60" x2="56" y2="70" stroke="${color.bg}" stroke-width="1"/>`;
      break;
    case 'tongue':
      mouth = `
        <path d="M35,60 Q50,70 65,60" fill="none" stroke="${color.fg}" stroke-width="2"/>
        <ellipse cx="50" cy="68" rx="8" ry="10" fill="#FF6B6B"/>`;
      break;
    case 'zigzag':
      mouth = `<polyline points="35,62 40,65 45,62 50,65 55,62 60,65 65,62" fill="none" stroke="${color.fg}" stroke-width="2"/>`;
      break;
    case 'small':
      mouth = `<circle cx="50" cy="65" r="3" fill="${color.fg}"/>`;
      break;
    case 'wide':
      mouth = `<rect x="30" y="60" width="40" height="8" rx="4" fill="${color.fg}"/>`;
      break;
    default:
      mouth = `<path d="M35,60 Q50,70 65,60" fill="none" stroke="${color.fg}" stroke-width="2"/>`;
  }
  
  // Additional features
  let extras = '';
  switch(feature) {
    case 'horns':
      extras = `
        <polygon points="30,25 33,15 36,25" fill="${color.accent}"/>
        <polygon points="64,25 67,15 70,25" fill="${color.accent}"/>`;
      break;
    case 'antenna':
      extras = `
        <line x1="45" y1="25" x2="45" y2="15" stroke="${color.accent}" stroke-width="2"/>
        <circle cx="45" cy="13" r="3" fill="${color.accent}"/>
        <line x1="55" y1="25" x2="55" y2="15" stroke="${color.accent}" stroke-width="2"/>
        <circle cx="55" cy="13" r="3" fill="${color.accent}"/>`;
      break;
    case 'spots':
      extras = `
        <circle cx="25" cy="50" r="3" fill="${color.accent}" opacity="0.5"/>
        <circle cx="75" cy="50" r="3" fill="${color.accent}" opacity="0.5"/>
        <circle cx="30" cy="65" r="2" fill="${color.accent}" opacity="0.5"/>
        <circle cx="70" cy="65" r="2" fill="${color.accent}" opacity="0.5"/>`;
      break;
    case 'fur':
      extras = `
        <path d="M15,50 Q10,45 15,40" fill="none" stroke="${color.accent}" stroke-width="1.5" opacity="0.6"/>
        <path d="M15,60 Q10,55 15,50" fill="none" stroke="${color.accent}" stroke-width="1.5" opacity="0.6"/>
        <path d="M85,50 Q90,45 85,40" fill="none" stroke="${color.accent}" stroke-width="1.5" opacity="0.6"/>
        <path d="M85,60 Q90,55 85,50" fill="none" stroke="${color.accent}" stroke-width="1.5" opacity="0.6"/>`;
      break;
    case 'ears':
      extras = `
        <circle cx="25" cy="40" r="8" fill="${color.bg}" stroke="${color.accent}" stroke-width="1.5"/>
        <circle cx="75" cy="40" r="8" fill="${color.bg}" stroke="${color.accent}" stroke-width="1.5"/>`;
      break;
    case 'spikes':
      extras = `
        <polygon points="35,20 37,10 39,20" fill="${color.accent}"/>
        <polygon points="45,18 47,8 49,18" fill="${color.accent}"/>
        <polygon points="55,18 57,8 59,18" fill="${color.accent}"/>
        <polygon points="65,20 67,10 69,20" fill="${color.accent}"/>`;
      break;
    case 'scales':
      extras = `
        <path d="M20,70 Q25,68 30,70 Q25,72 20,70" fill="${color.accent}" opacity="0.4"/>
        <path d="M70,70 Q75,68 80,70 Q75,72 70,70" fill="${color.accent}" opacity="0.4"/>`;
      break;
    default:
      extras = '';
  }
  
  return svgStart + background + extras + monsterBody + eyes + mouth + svgEnd;
}

/**
 * Generate unique avatar indices based on guest ID
 */
function getAvatarIndices(guestId) {
  // Use guest ID to generate consistent but varied indices
  const hash = guestId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    colorIndex: hash % AVATAR_COLORS.length,
    shapeIndex: Math.floor(hash / 10) % MONSTER_SHAPES.length,
    eyeIndex: Math.floor(hash / 20) % EYE_STYLES.length,
    mouthIndex: Math.floor(hash / 30) % MOUTH_STYLES.length,
    featureIndex: Math.floor(hash / 40) % FEATURES.length
  };
}

/**
 * Get avatar data URL for a guest user
 */
export function getGuestAvatarDataURL(guestId) {
  const { colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex } = getAvatarIndices(guestId);
  const svg = generateAvatarSVG(colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex);
  
  // Handle both browser and Node environments
  if (typeof window !== 'undefined') {
    // Browser environment - use btoa
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  } else {
    // Node environment - use Buffer
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
}

/**
 * Get avatar configuration for a guest user
 */
export function getGuestAvatarConfig(guestId) {
  const { colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex } = getAvatarIndices(guestId);
  
  return {
    color: AVATAR_COLORS[colorIndex],
    shape: MONSTER_SHAPES[shapeIndex],
    eyeStyle: EYE_STYLES[eyeIndex],
    mouthStyle: MOUTH_STYLES[mouthIndex],
    feature: FEATURES[featureIndex],
    svg: generateAvatarSVG(colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex)
  };
}

/**
 * Generate a pool of pre-made avatars
 */
export function generateAvatarPool(count = 20) {
  const avatars = [];
  
  for (let i = 0; i < count; i++) {
    const colorIndex = i % AVATAR_COLORS.length;
    const shapeIndex = Math.floor(i / AVATAR_COLORS.length) % MONSTER_SHAPES.length;
    const eyeIndex = (i * 2) % EYE_STYLES.length;
    const mouthIndex = (i * 3) % MOUTH_STYLES.length;
    const featureIndex = (i * 4) % FEATURES.length;
    
    avatars.push({
      id: `guest-avatar-${i}`,
      color: AVATAR_COLORS[colorIndex],
      shape: MONSTER_SHAPES[shapeIndex],
      eyeStyle: EYE_STYLES[eyeIndex],
      mouthStyle: MOUTH_STYLES[mouthIndex],
      feature: FEATURES[featureIndex],
      svg: generateAvatarSVG(colorIndex, shapeIndex, eyeIndex, mouthIndex, featureIndex),
      inUse: false
    });
  }
  
  return avatars;
}

// Avatar pool manager for server-side
class AvatarPoolManager {
  constructor() {
    this.pool = generateAvatarPool(20);
    this.assignments = new Map(); // guestId -> avatarId
  }
  
  assignAvatar(guestId) {
    // Check if already assigned
    if (this.assignments.has(guestId)) {
      return this.assignments.get(guestId);
    }
    
    // Find available avatar
    const available = this.pool.find(a => !a.inUse);
    if (!available) {
      // All avatars in use, generate based on ID
      return getGuestAvatarConfig(guestId);
    }
    
    // Mark as in use and assign
    available.inUse = true;
    this.assignments.set(guestId, available.id);
    return available;
  }
  
  releaseAvatar(guestId) {
    const avatarId = this.assignments.get(guestId);
    if (avatarId) {
      const avatar = this.pool.find(a => a.id === avatarId);
      if (avatar) {
        avatar.inUse = false;
      }
      this.assignments.delete(guestId);
    }
  }
  
  getAvatar(guestId) {
    const avatarId = this.assignments.get(guestId);
    if (avatarId) {
      return this.pool.find(a => a.id === avatarId);
    }
    return null;
  }
}

// Export singleton instance
export const avatarPool = new AvatarPoolManager();