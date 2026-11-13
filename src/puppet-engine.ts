/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 2.5D Chibi Cutout Puppet Engine ("OverSimplified / Paradox History & Explainer" style)
 * Deterministic 60fps Canvas 2D renderer shared between Browser Preview, Local Export,
 * Headless Cloud Worker, and Remotion Cloud Render.
 */

export type PuppetArchetype =
  | 'flag_fighter'
  | 'monarch'
  | 'hero_rebel'
  | 'squad_army'
  | 'inquisitor'
  | 'tycoon'
  | 'storyteller';

export type PuppetFaction =
  | 'england'
  | 'france'
  | 'france_royal'
  | 'usa'
  | 'rome'
  | 'germany'
  | 'spain'
  | 'emerald'
  | 'crimson'
  | 'gold';

export type PuppetExpression =
  | 'neutral'
  | 'talking'
  | 'happy'
  | 'angry'
  | 'shocked'
  | 'scheming'
  | 'defeated';

export type PuppetAction =
  | 'idle-bob'
  | 'talk-gesture'
  | 'arms-up'
  | 'sword-clash'
  | 'bow-volley'
  | 'cavalry-charge'
  | 'equip-upgrade'
  | 'read-scroll';

export type PuppetDualMode =
  | 'single'
  | 'duel-clash'
  | 'dialogue-versus'
  | 'trial-scene';

export type PuppetMovementPath =
  | 'stationary'
  | 'enter-left'
  | 'enter-right'
  | 'march-across'
  | 'converge-center';

export interface PuppetStageEvent {
  id: string;
  type: 'puppetStage';
  start: number;
  end: number;
  presetId?: string;
  theme?: string;
  title?: string;
  subtitle?: string;
  puppetId: PuppetArchetype;
  puppet?: PuppetArchetype;
  faction?: PuppetFaction;
  expression?: PuppetExpression;
  action?: PuppetAction;
  dualMode?: PuppetDualMode;
  movementPath?: PuppetMovementPath;
  audioLipSync?: boolean;
  dialogueLines?: string;     // Multi-beat back-and-forth comic dialogue (one beat per line, e.g. "Left: ...\nRight: ...")
  secondaryPuppetId?: PuppetArchetype;
  secondaryPuppet?: PuppetArchetype;
  secondaryFaction?: PuppetFaction;
  secondaryExpression?: PuppetExpression;
  secondaryBubbleText?: string;
  secondaryBubble?: string;
  showRpgStats?: boolean;
  statValues?: string;        // e.g. "👑 0 | ⚔️ 0 | ✊ 100"
  bubbleText?: string;        // Speech bubble above primary puppet
  speechBubble?: string;
  floatingCounterText?: string; // e.g. "+1" or "116 years"
  floatingCounter?: string;
  position?: string;
  customX?: number;
  customY?: number;
  scale?: number;
  accentColor?: string;
  textColor?: string;
  animationType?: 'pop' | 'bounce' | 'slide-up' | 'slide-left' | 'fade' | 'elastic';
  sfxTrigger?: any;
}

export interface PuppetPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<PuppetStageEvent>;
}

export const PUPPET_ARCHETYPE_META: Record<
  PuppetArchetype,
  { name: string; icon: string; badge: string; defaultFaction: PuppetFaction; defaultAction: PuppetAction }
> = {
  flag_fighter: {
    name: '🛡️ The Flag Fighter (Nation Knight)',
    icon: '🛡️',
    badge: 'Geopolitics & Wars',
    defaultFaction: 'england',
    defaultAction: 'sword-clash',
  },
  monarch: {
    name: '👑 The Monarch / World Leader',
    icon: '👑',
    badge: 'Empires & Rulers',
    defaultFaction: 'england',
    defaultAction: 'talk-gesture',
  },
  hero_rebel: {
    name: '🚩 The Hero / Underdog (Upgradeable)',
    icon: '🚩',
    badge: 'Hero Journey & Upgrades',
    defaultFaction: 'france_royal',
    defaultAction: 'equip-upgrade',
  },
  squad_army: {
    name: '🏹 The Squad / Army Formation',
    icon: '🏹',
    badge: 'Battles & Volleys',
    defaultFaction: 'england',
    defaultAction: 'bow-volley',
  },
  inquisitor: {
    name: '📜 The Inquisitor / Judge',
    icon: '📜',
    badge: 'Trials, Law & Villains',
    defaultFaction: 'crimson',
    defaultAction: 'read-scroll',
  },
  tycoon: {
    name: '💼 The Tycoon / Trader',
    icon: '💼',
    badge: 'Finance, Markets & Tech',
    defaultFaction: 'emerald',
    defaultAction: 'talk-gesture',
  },
  storyteller: {
    name: '💡 The Storyteller / Explainer',
    icon: '💡',
    badge: 'Commentary & Science',
    defaultFaction: 'gold',
    defaultAction: 'arms-up',
  },
};

export const PUPPET_SCENE_PRESETS: PuppetPreset[] = [
  {
    id: 'hundred-years-duel',
    name: '⚔️ England vs France Sword Duel (100 Years)',
    description: 'Two flag knights clashing broadswords with spark bursts and ticking year counter',
    config: {
      title: '116 years',
      subtitle: 'England vs France',
      puppetId: 'flag_fighter',
      faction: 'england',
      expression: 'angry',
      action: 'sword-clash',
      dualMode: 'duel-clash',
      movementPath: 'converge-center',
      audioLipSync: true,
      secondaryPuppetId: 'flag_fighter',
      secondaryFaction: 'france',
      secondaryExpression: 'angry',
      showRpgStats: false,
      floatingCounterText: '116 years',
      scale: 1.05,
    },
  },
  {
    id: 'joan-rpg-upgrade',
    name: '🚩 Joan of Arc: Peasant → Armor, Warhorse & Banner',
    description: 'Progressive word-timed equipment pop-ins with RPG stat badge (Crown 0 | Army 0 | Confidence 100)',
    config: {
      title: 'Joan of Arc',
      subtitle: 'Domrémy',
      puppetId: 'hero_rebel',
      faction: 'france_royal',
      expression: 'talking',
      action: 'equip-upgrade',
      dualMode: 'single',
      movementPath: 'enter-left',
      audioLipSync: true,
      showRpgStats: true,
      statValues: '👑 0 | ⚔️ 0 | ✊ 100',
      bubbleText: 'I must save France!',
      floatingCounterText: '+1 🌿',
      scale: 1.1,
    },
  },
  {
    id: 'longbow-volley',
    name: '🏹 Longbowmen Arrow Volley vs Knights',
    description: 'Squad formation firing parabolic arrow volleys across the battlefield',
    config: {
      title: 'English Longbowmen',
      subtitle: 'Battle of Agincourt / Crécy',
      puppetId: 'squad_army',
      faction: 'england',
      expression: 'scheming',
      action: 'bow-volley',
      dualMode: 'single',
      movementPath: 'stationary',
      audioLipSync: true,
      showRpgStats: false,
      bubbleText: 'Hehehe yeah boy!',
      scale: 1.0,
    },
  },
  {
    id: 'royal-diplomacy',
    name: '👑 Rival Kings Diplomacy ("Become King of France too?")',
    description: 'King of England and King of France exchanging speech bubbles on map',
    config: {
      title: '1337',
      subtitle: 'Royal Succession Crisis',
      puppetId: 'monarch',
      faction: 'england',
      expression: 'happy',
      action: 'talk-gesture',
      dualMode: 'dialogue-versus',
      movementPath: 'converge-center',
      audioLipSync: true,
      secondaryPuppetId: 'monarch',
      secondaryFaction: 'france_royal',
      secondaryExpression: 'shocked',
      bubbleText: 'Why not become King of France too?',
      secondaryBubbleText: 'Um... no.',
      showRpgStats: false,
      scale: 1.0,
    },
  },
  {
    id: 'inquisitor-trial',
    name: '📜 The Tribunal Trial (Inquisitor Scroll & Fire)',
    description: 'Captive armored hero at the stake facing hooded inquisitor reading charges with rising flames',
    config: {
      title: 'Church Tribunal',
      subtitle: 'Rouen 1431',
      puppetId: 'inquisitor',
      faction: 'crimson',
      expression: 'angry',
      action: 'read-scroll',
      dualMode: 'trial-scene',
      movementPath: 'stationary',
      audioLipSync: true,
      secondaryPuppetId: 'hero_rebel',
      secondaryFaction: 'france_royal',
      secondaryExpression: 'angry',
      bubbleText: 'Sentence: Burn her!',
      showRpgStats: false,
      scale: 1.05,
    },
  },
  {
    id: 'market-bull-bear',
    name: '💼 Bull vs Bear Market Duel (Finance Tycoon)',
    description: 'Wall Street / Crypto traders clashing green & red chart swords with profit popups',
    config: {
      title: 'MARKET SHOWDOWN',
      subtitle: 'Bulls vs Bears',
      puppetId: 'tycoon',
      faction: 'emerald',
      expression: 'happy',
      action: 'sword-clash',
      dualMode: 'duel-clash',
      secondaryPuppetId: 'tycoon',
      secondaryFaction: 'crimson',
      secondaryExpression: 'shocked',
      showRpgStats: true,
      statValues: '💰 99 | 📈 +420% | 🔥 100',
      floatingCounterText: '+$100K',
      scale: 1.0,
    },
  },
  {
    id: 'history-explainer',
    name: '💡 OverSimplified Storyteller (Arms-Up Explainer)',
    description: 'Expressive chibi narrator raising stick arms with pointer & thought bubble',
    config: {
      title: 'Wait... What?!',
      subtitle: 'Key Turning Point',
      puppetId: 'storyteller',
      faction: 'gold',
      expression: 'talking',
      action: 'arms-up',
      dualMode: 'single',
      showRpgStats: false,
      bubbleText: 'And no one could stop this!',
      scale: 1.1,
    },
  },
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function getFactionColors(faction: PuppetFaction = 'england'): {
  primary: string;
  secondary: string;
  accent: string;
} {
  switch (faction) {
    case 'england':
      return { primary: '#DC2626', secondary: '#FFFFFF', accent: '#F59E0B' };
    case 'france':
      return { primary: '#1D4ED8', secondary: '#FFFFFF', accent: '#EF4444' };
    case 'france_royal':
      return { primary: '#1E40AF', secondary: '#FACC15', accent: '#FEF08A' };
    case 'usa':
      return { primary: '#1E3A8A', secondary: '#DC2626', accent: '#FFFFFF' };
    case 'rome':
      return { primary: '#991B1B', secondary: '#F59E0B', accent: '#FEF3C7' };
    case 'germany':
      return { primary: '#1F2937', secondary: '#DC2626', accent: '#FACC15' };
    case 'spain':
      return { primary: '#B91C1C', secondary: '#FACC15', accent: '#FFFFFF' };
    case 'emerald':
      return { primary: '#059669', secondary: '#A7F3D0', accent: '#34D399' };
    case 'crimson':
      return { primary: '#7F1D1D', secondary: '#EF4444', accent: '#FCA5A5' };
    case 'gold':
    default:
      return { primary: '#D97706', secondary: '#FEF3C7', accent: '#F59E0B' };
  }
}

/**
 * Draws a faction flag / heraldry pattern clipped inside the current path or rectangle.
 */
function drawFactionPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  faction: PuppetFaction = 'england'
) {
  const colors = getFactionColors(faction);
  ctx.fillStyle = colors.primary;
  ctx.fillRect(x, y, w, h);

  if (faction === 'england') {
    // Union Jack / St. George Cross hybrid (like the England knight at 0:01)
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x, y, w, h);
    // White diagonals
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(3, w * 0.16);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    // Red diagonals
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = Math.max(1.5, w * 0.08);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    // White cross
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w * 0.38, y, w * 0.24, h);
    ctx.fillRect(x, y + h * 0.38, w, h * 0.24);
    // Red St. George cross
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + w * 0.43, y, w * 0.14, h);
    ctx.fillRect(x, y + h * 0.43, w, h * 0.14);
  } else if (faction === 'france') {
    // French Tricolor (Blue, White, Red)
    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(x, y, w / 3, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + w / 3, y, w / 3, h);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x + (w * 2) / 3, y, w / 3, h);
  } else if (faction === 'france_royal') {
    // Royal Blue with Golden Fleur-de-lis motifs (Joan of Arc / Capetian style)
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FACC15';
    const spots = [
      [0.28, 0.3],
      [0.72, 0.3],
      [0.5, 0.55],
      [0.28, 0.78],
      [0.72, 0.78],
    ];
    for (const [sx, sy] of spots) {
      drawMiniFleurDeLis(ctx, x + w * sx, y + h * sy, Math.min(w, h) * 0.11);
    }
  } else if (faction === 'usa') {
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 1; i < 6; i += 2) {
      ctx.fillRect(x, y + (h / 6) * i, w, h / 6);
    }
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(x, y, w * 0.48, h * 0.52);
  } else if (faction === 'germany') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, y, w, h / 3);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x, y + h / 3, w, h / 3);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x, y + (h * 2) / 3, w, h / 3);
  } else if (faction === 'spain') {
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x, y + h * 0.25, w, h * 0.5);
  }
}

function drawMiniFleurDeLis(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  // Center petal
  ctx.moveTo(0, -r * 1.2);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.3, 0, r * 0.7);
  ctx.quadraticCurveTo(-r * 0.55, -r * 0.3, 0, -r * 1.2);
  // Left petal
  ctx.moveTo(0, r * 0.1);
  ctx.quadraticCurveTo(-r * 1.1, -r * 0.6, -r * 0.9, r * 0.4);
  ctx.quadraticCurveTo(-r * 0.4, r * 0.3, 0, r * 0.4);
  // Right petal
  ctx.moveTo(0, r * 0.1);
  ctx.quadraticCurveTo(r * 1.1, -r * 0.6, r * 0.9, r * 0.4);
  ctx.quadraticCurveTo(r * 0.4, r * 0.3, 0, r * 0.4);
  ctx.fill();
  // Crossbar
  ctx.fillRect(-r * 0.65, r * 0.2, r * 1.3, r * 0.22);
  ctx.restore();
}

/**
 * Draws the chibi face (eyes, eyebrows, mouth) inside a head centered at (0, headY) with radius headR.
 */
function drawChibiFace(
  ctx: CanvasRenderingContext2D,
  headY: number,
  headR: number,
  expression: PuppetExpression,
  localT: number,
  facingRight: boolean,
  lipSyncEnergy: number = 0
) {
  const dir = facingRight ? 1 : -1;
  const eyeOffsetX = headR * 0.34;
  const eyeY = headY + headR * 0.06;
  const eyeR = Math.max(2.5, headR * 0.11);

  ctx.save();
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = '#1C1917';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const leftEyeX = -eyeOffsetX + dir * headR * 0.06;
  const rightEyeX = eyeOffsetX + dir * headR * 0.06;

  if (expression === 'defeated') {
    // X-eyes
    ctx.lineWidth = Math.max(2, headR * 0.07);
    for (const ex of [leftEyeX, rightEyeX]) {
      ctx.beginPath();
      ctx.moveTo(ex - eyeR, eyeY - eyeR);
      ctx.lineTo(ex + eyeR, eyeY + eyeR);
      ctx.moveTo(ex + eyeR, eyeY - eyeR);
      ctx.lineTo(ex - eyeR, eyeY + eyeR);
      ctx.stroke();
    }
  } else {
    // Standard solid chibi eyes (with subtle blink every 3.2s)
    const blinkCycle = localT % 3.2;
    const isBlinking = blinkCycle > 3.08;
    for (const ex of [leftEyeX, rightEyeX]) {
      ctx.beginPath();
      if (isBlinking) {
        ctx.lineWidth = Math.max(2, headR * 0.07);
        ctx.moveTo(ex - eyeR, eyeY);
        ctx.lineTo(ex + eyeR, eyeY);
        ctx.stroke();
      } else if (expression === 'shocked') {
        ctx.arc(ex, eyeY, eyeR * 1.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1C1917';
      } else {
        ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Eyebrows for angry / scheming / shocked
  if (expression === 'angry' || expression === 'scheming') {
    ctx.lineWidth = Math.max(2.2, headR * 0.085);
    ctx.beginPath();
    // Slanted inward V-brows
    ctx.moveTo(leftEyeX - eyeR * 1.3, eyeY - eyeR * 2.1);
    ctx.lineTo(leftEyeX + eyeR * 1.1, eyeY - eyeR * 1.1);
    ctx.moveTo(rightEyeX + eyeR * 1.3, eyeY - eyeR * 2.1);
    ctx.lineTo(rightEyeX - eyeR * 1.1, eyeY - eyeR * 1.1);
    ctx.stroke();
  }

  // Mouth (supports both expression === 'talking' and audio-reactive lipSyncEnergy)
  const mouthX = dir * headR * 0.06;
  const mouthY = headY + headR * 0.44;
  ctx.lineWidth = Math.max(2, headR * 0.075);

  const isTalkingMouth = (expression === 'talking' && Math.sin(localT * 16) > -0.2) || lipSyncEnergy > 0.12;
  if (isTalkingMouth) {
    // Animated open talking mouth synced with voiceover cadence or talking expression
    const cadence = lipSyncEnergy > 0.12 ? lipSyncEnergy : Math.abs(Math.sin(localT * 14));
    const openH = headR * (0.11 + 0.14 * clamp01(cadence));
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY, headR * 0.18, openH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (expression === 'happy' || expression === 'scheming') {
    ctx.beginPath();
    ctx.arc(mouthX, mouthY - headR * 0.05, headR * 0.18, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (expression === 'angry') {
    ctx.beginPath();
    ctx.arc(mouthX, mouthY + headR * 0.12, headR * 0.18, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else if (expression === 'shocked') {
    ctx.beginPath();
    ctx.arc(mouthX, mouthY, headR * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Classic OverSimplified flat line mouth
    ctx.beginPath();
    ctx.moveTo(mouthX - headR * 0.16, mouthY);
    ctx.lineTo(mouthX + headR * 0.16, mouthY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a single rigged puppet centered at (cx, cy) with base height `unitH`.
 */
function drawSinglePuppet(
  ctx: CanvasRenderingContext2D,
  archetype: PuppetArchetype,
  faction: PuppetFaction,
  expression: PuppetExpression,
  action: PuppetAction,
  localT: number,
  clipProgress: number,
  cx: number,
  cy: number,
  unitH: number,
  facingRight: boolean,
  lipSyncEnergy: number = 0
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Subtle idle or action bobbing
  const bobFreq = action === 'cavalry-charge' || action === 'sword-clash' ? 14 : 6;
  const bobAmp = action === 'cavalry-charge' ? unitH * 0.045 : unitH * 0.018;
  const bobY = Math.sin(localT * bobFreq) * bobAmp;
  ctx.translate(0, bobY);

  const dir = facingRight ? 1 : -1;
  const headR = unitH * 0.22;
  const bodyW = unitH * 0.44;
  const bodyH = unitH * 0.44;
  const headY = -unitH * 0.22;
  const bodyTopY = headY + headR * 0.72;

  const colors = getFactionColors(faction);

  // Determine progressive equipment state for hero_rebel in 'equip-upgrade' action (Joan of Arc 0:46-0:56)
  const isUpgradeAction = archetype === 'hero_rebel' && action === 'equip-upgrade';
  const hasArmor = archetype === 'flag_fighter' || (archetype === 'hero_rebel' && (!isUpgradeAction || clipProgress >= 0.22));
  const hasHorse = (archetype === 'hero_rebel' && isUpgradeAction && clipProgress >= 0.45) || action === 'cavalry-charge';
  const hasBanner = archetype === 'hero_rebel' && (!isUpgradeAction || clipProgress >= 0.65);

  const armorScale = isUpgradeAction && hasArmor ? easeOutBack(clamp01((clipProgress - 0.22) / 0.14)) : 1;
  const horseScale = isUpgradeAction && hasHorse ? easeOutBack(clamp01((clipProgress - 0.45) / 0.14)) : 1;
  const bannerScale = isUpgradeAction && hasBanner ? easeOutBack(clamp01((clipProgress - 0.65) / 0.14)) : 1;

  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.ellipse(0, bodyTopY + bodyH + (hasHorse ? unitH * 0.18 : unitH * 0.04), bodyW * (hasHorse ? 0.95 : 0.65), unitH * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // White die-cut sticker outline glow around character
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 0;

  // 1. Optional glowing aura ring behind Hero
  if (archetype === 'hero_rebel') {
    const auraR = unitH * (0.58 + 0.04 * Math.sin(localT * 5));
    const grad = ctx.createRadialGradient(0, 0, unitH * 0.1, 0, 0, auraR);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
    grad.addColorStop(0.65, 'rgba(250, 204, 21, 0.18)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, auraR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Flowing Cape (for Monarch, armored Hero, or Inquisitor)
  if (archetype === 'monarch' || hasArmor || archetype === 'inquisitor') {
    ctx.save();
    ctx.fillStyle = archetype === 'inquisitor' ? '#18181B' : '#B91C1C';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = Math.max(2.5, unitH * 0.018);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.42, bodyTopY + bodyH * 0.05);
    ctx.quadraticCurveTo(-bodyW * 0.72, bodyTopY + bodyH * 0.6, -bodyW * 0.58, bodyTopY + bodyH * 1.02);
    ctx.lineTo(bodyW * 0.58, bodyTopY + bodyH * 1.02);
    ctx.quadraticCurveTo(bodyW * 0.72, bodyTopY + bodyH * 0.6, bodyW * 0.42, bodyTopY + bodyH * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 3. Body / Torso
  ctx.save();
  ctx.lineWidth = Math.max(2.5, unitH * 0.02);
  ctx.strokeStyle = '#111827';

  if (archetype === 'flag_fighter') {
    // Flag-patterned blocky knight torso (like 0:01 UK & France knights)
    roundRectPath(ctx, -bodyW * 0.5, bodyTopY, bodyW, bodyH * 0.85, unitH * 0.05);
    ctx.save();
    ctx.clip();
    drawFactionPattern(ctx, -bodyW * 0.5, bodyTopY, bodyW, bodyH * 0.85, faction);
    ctx.restore();
    ctx.stroke();
  } else if (archetype === 'monarch') {
    // Royal robe with white ermine trim + gold chain
    roundRectPath(ctx, -bodyW * 0.54, bodyTopY, bodyW * 1.08, bodyH, unitH * 0.08);
    ctx.fillStyle = colors.primary;
    ctx.fill();
    ctx.stroke();
    // White ermine center column
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-bodyW * 0.14, bodyTopY, bodyW * 0.28, bodyH);
    ctx.strokeRect(-bodyW * 0.14, bodyTopY, bodyW * 0.28, bodyH);
  } else if (archetype === 'hero_rebel' && hasArmor) {
    // Silver plate armor with belt & fleur-de-lis skirt (like Joan at 0:54 & 1:19)
    ctx.save();
    ctx.scale(armorScale, armorScale);
    roundRectPath(ctx, -bodyW * 0.5, bodyTopY, bodyW, bodyH, unitH * 0.07);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.stroke();
    // Red cross on breastplate
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-bodyW * 0.06, bodyTopY + bodyH * 0.12, bodyW * 0.12, bodyH * 0.42);
    ctx.fillRect(-bodyW * 0.2, bodyTopY + bodyH * 0.24, bodyW * 0.4, bodyH * 0.1);
    // Royal blue fleur-de-lis skirt border
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(-bodyW * 0.48, bodyTopY + bodyH * 0.68, bodyW * 0.96, bodyH * 0.3);
    ctx.strokeRect(-bodyW * 0.48, bodyTopY + bodyH * 0.68, bodyW * 0.96, bodyH * 0.3);
    // Leather belt
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-bodyW * 0.5, bodyTopY + bodyH * 0.56, bodyW, bodyH * 0.12);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-bodyW * 0.09, bodyTopY + bodyH * 0.55, bodyW * 0.18, bodyH * 0.14);
    ctx.restore();
  } else if (archetype === 'hero_rebel') {
    // Peasant brown burlap tunic & apron (like Joan at 0:46)
    roundRectPath(ctx, -bodyW * 0.5, bodyTopY, bodyW, bodyH, unitH * 0.07);
    ctx.fillStyle = '#78350F';
    ctx.fill();
    ctx.stroke();
    // Tan apron
    roundRectPath(ctx, -bodyW * 0.34, bodyTopY + bodyH * 0.22, bodyW * 0.68, bodyH * 0.65, unitH * 0.04);
    ctx.fillStyle = '#D6C5B3';
    ctx.fill();
    ctx.stroke();
    // Rope belt
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = Math.max(2, unitH * 0.015);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.48, bodyTopY + bodyH * 0.25);
    ctx.lineTo(bodyW * 0.48, bodyTopY + bodyH * 0.25);
    ctx.stroke();
  } else if (archetype === 'inquisitor') {
    // Dark inquisitor robes with red trim & silver cross (like 1:22)
    roundRectPath(ctx, -bodyW * 0.55, bodyTopY, bodyW * 1.1, bodyH, unitH * 0.08);
    ctx.fillStyle = '#27272A';
    ctx.fill();
    ctx.stroke();
    // Red trim lines
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = Math.max(2.5, unitH * 0.018);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.18, bodyTopY);
    ctx.lineTo(-bodyW * 0.26, bodyTopY + bodyH);
    ctx.moveTo(bodyW * 0.18, bodyTopY);
    ctx.lineTo(bodyW * 0.26, bodyTopY + bodyH);
    ctx.stroke();
    // Belt & hanging cross
    ctx.fillStyle = '#451A03';
    ctx.fillRect(-bodyW * 0.52, bodyTopY + bodyH * 0.52, bodyW * 1.04, bodyH * 0.12);
    ctx.strokeStyle = '#E4E4E7';
    ctx.lineWidth = Math.max(2, unitH * 0.015);
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.15, bodyTopY + bodyH * 0.64);
    ctx.lineTo(bodyW * 0.15, bodyTopY + bodyH * 0.88);
    ctx.moveTo(bodyW * 0.06, bodyTopY + bodyH * 0.74);
    ctx.lineTo(bodyW * 0.24, bodyTopY + bodyH * 0.74);
    ctx.stroke();
  } else if (archetype === 'tycoon') {
    // Executive Charcoal Suit & Tie
    roundRectPath(ctx, -bodyW * 0.48, bodyTopY, bodyW * 0.96, bodyH, unitH * 0.06);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.stroke();
    // White shirt V
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.18, bodyTopY);
    ctx.lineTo(bodyW * 0.18, bodyTopY);
    ctx.lineTo(0, bodyTopY + bodyH * 0.48);
    ctx.closePath();
    ctx.fill();
    // Power tie
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.05, bodyTopY + bodyH * 0.05);
    ctx.lineTo(bodyW * 0.05, bodyTopY + bodyH * 0.05);
    ctx.lineTo(bodyW * 0.08, bodyTopY + bodyH * 0.62);
    ctx.lineTo(0, bodyTopY + bodyH * 0.72);
    ctx.lineTo(-bodyW * 0.08, bodyTopY + bodyH * 0.62);
    ctx.closePath();
    ctx.fill();
  } else {
    // Storyteller / Squad Tunic
    roundRectPath(ctx, -bodyW * 0.46, bodyTopY, bodyW * 0.92, bodyH * 0.9, unitH * 0.07);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.stroke();
    // Cross straps / tunic stripes
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = Math.max(3, unitH * 0.025);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.35, bodyTopY + bodyH * 0.08);
    ctx.lineTo(bodyW * 0.35, bodyTopY + bodyH * 0.82);
    ctx.moveTo(bodyW * 0.35, bodyTopY + bodyH * 0.08);
    ctx.lineTo(-bodyW * 0.35, bodyTopY + bodyH * 0.82);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Head & Helmet / Crown / Hood
  ctx.save();
  ctx.lineWidth = Math.max(2.5, unitH * 0.02);
  ctx.strokeStyle = '#111827';

  if (archetype === 'flag_fighter') {
    // Crusader Great Helm (bucket helmet like 0:01)
    const helmW = headR * 1.85;
    const helmH = headR * 1.95;
    roundRectPath(ctx, -helmW / 2, headY - helmH * 0.52, helmW, helmH, headR * 0.25);
    ctx.fillStyle = faction === 'england' ? '#D4D4D8' : '#94A3B8';
    ctx.fill();
    ctx.stroke();
    // Gold cross trim on helmet
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-helmW * 0.08, headY - helmH * 0.5, helmW * 0.16, helmH * 0.96);
    ctx.fillRect(-helmW * 0.48, headY - helmH * 0.08, helmW * 0.96, helmH * 0.16);
    // Dark eye slits
    ctx.fillStyle = '#09090B';
    ctx.fillRect(-helmW * 0.36, headY - helmH * 0.12, helmW * 0.28, helmH * 0.09);
    ctx.fillRect(helmW * 0.08, headY - helmH * 0.12, helmW * 0.28, helmH * 0.09);
  } else {
    // Flesh/Chibi round head
    ctx.fillStyle = '#FDE6D8';
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair / Beard
    ctx.fillStyle = archetype === 'monarch' || archetype === 'inquisitor' ? '#451A03' : '#573016';
    ctx.beginPath();
    ctx.arc(0, headY - headR * 0.12, headR * 0.96, Math.PI * 1.08, Math.PI * 1.92);
    ctx.fill();

    if (archetype === 'monarch' || archetype === 'inquisitor') {
      // Full beard around chin
      ctx.beginPath();
      ctx.arc(0, headY + headR * 0.12, headR * 0.92, 0.12 * Math.PI, 0.88 * Math.PI);
      ctx.lineWidth = headR * 0.28;
      ctx.strokeStyle = archetype === 'inquisitor' ? '#27272A' : '#573016';
      ctx.stroke();
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = Math.max(2, unitH * 0.018);
    }

    // Facial features
    drawChibiFace(ctx, headY, headR, expression, localT, facingRight, lipSyncEnergy);

    // Headgear
    if (archetype === 'monarch') {
      // Ornate Royal Crown (like 0:16)
      const cw = headR * 1.55;
      const ch = headR * 0.78;
      const cyTop = headY - headR * 1.25;
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.arc(0, cyTop + ch * 0.65, cw * 0.48, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-cw / 2, cyTop + ch);
      ctx.lineTo(-cw * 0.55, cyTop + ch * 0.2);
      ctx.lineTo(-cw * 0.25, cyTop + ch * 0.55);
      ctx.lineTo(0, cyTop);
      ctx.lineTo(cw * 0.25, cyTop + ch * 0.55);
      ctx.lineTo(cw * 0.55, cyTop + ch * 0.2);
      ctx.lineTo(cw / 2, cyTop + ch);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (archetype === 'hero_rebel' && hasArmor) {
      // Open-visor Knight Helmet (like Joan at 0:54)
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.1, headR * 1.08, Math.PI * 1.05, Math.PI * 1.95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Visor ridge with rivets
      ctx.fillStyle = '#94A3B8';
      roundRectPath(ctx, -headR * 1.05, headY - headR * 0.58, headR * 2.1, headR * 0.32, headR * 0.12);
      ctx.fill();
      ctx.stroke();
    } else if (archetype === 'hero_rebel') {
      // Peasant headscarf (like Joan at 0:46)
      ctx.fillStyle = '#E7E5E4';
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.12, headR * 1.04, Math.PI * 1.02, Math.PI * 1.98);
      ctx.fill();
      ctx.stroke();
    } else if (archetype === 'inquisitor') {
      // Dark cowl hood arch
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = headR * 0.32;
      ctx.beginPath();
      ctx.arc(0, headY, headR * 1.05, Math.PI * 0.85, Math.PI * 2.15);
      ctx.stroke();
    } else if (archetype === 'tycoon') {
      // Classic Wall Street Top Hat + Gold Monocle
      const brimW = headR * 2.1;
      const hatW = headR * 1.35;
      const hatH = headR * 1.15;
      const hatTopY = headY - headR * 0.82 - hatH;
      ctx.fillStyle = '#18181B';
      roundRectPath(ctx, -hatW / 2, hatTopY, hatW, hatH, headR * 0.12);
      ctx.fill();
      ctx.stroke();
      // Ribbon band
      ctx.fillStyle = colors.primary;
      ctx.fillRect(-hatW / 2, hatTopY + hatH * 0.76, hatW, hatH * 0.18);
      // Hat brim
      ctx.fillStyle = '#18181B';
      roundRectPath(ctx, -brimW / 2, headY - headR * 0.88, brimW, headR * 0.22, headR * 0.08);
      ctx.fill();
      ctx.stroke();
      // Gold monocle over front eye
      const monoX = (facingRight ? 1 : -1) * headR * 0.38;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = Math.max(1.5, unitH * 0.014);
      ctx.beginPath();
      ctx.arc(monoX, headY + headR * 0.06, headR * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    } else if (archetype === 'storyteller') {
      // Scholar Beret / Cap + Round Glasses
      ctx.fillStyle = '#1E3A8A';
      ctx.beginPath();
      ctx.ellipse(0, headY - headR * 0.88, headR * 1.15, headR * 0.36, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Gold tassel
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = Math.max(2, unitH * 0.015);
      ctx.beginPath();
      ctx.moveTo(headR * 0.6, headY - headR * 0.95);
      ctx.lineTo(headR * 1.05, headY - headR * 0.55);
      ctx.stroke();
    } else if (archetype === 'squad_army') {
      // Steel Kettle Helm for Longbowmen / Infantry
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(0, headY - headR * 0.15, headR * 1.02, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      roundRectPath(ctx, -headR * 1.28, headY - headR * 0.22, headR * 2.56, headR * 0.18, headR * 0.08);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();

  // 5. Stick Arms & Weapons / Shields / Scrolls / Banners
  ctx.save();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = Math.max(3, unitH * 0.025);
  ctx.lineCap = 'round';

  const shoulderY = bodyTopY + bodyH * 0.22;
  const leftShoulderX = -bodyW * 0.48;
  const rightShoulderX = bodyW * 0.48;

  if (action === 'arms-up') {
    // Exuberant raised stick arms (like Joan at 0:50 "I must save France!")
    const wave = Math.sin(localT * 12) * (unitH * 0.04);
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, shoulderY);
    ctx.quadraticCurveTo(leftShoulderX - unitH * 0.15, headY, leftShoulderX - unitH * 0.1, headY - headR * 1.15 + wave);
    ctx.moveTo(rightShoulderX, shoulderY);
    ctx.quadraticCurveTo(rightShoulderX + unitH * 0.15, headY, rightShoulderX + unitH * 0.1, headY - headR * 1.15 - wave);
    ctx.stroke();
  } else if (action === 'sword-clash' || archetype === 'flag_fighter') {
    // Swinging broadsword in front hand + heraldic shield on off-hand
    const swingAngle = Math.sin(localT * 15) * 0.65;
    const weaponShoulderX = dir > 0 ? rightShoulderX : leftShoulderX;
    const shieldShoulderX = dir > 0 ? leftShoulderX : rightShoulderX;

    // Sword arm + broadsword
    ctx.save();
    ctx.translate(weaponShoulderX, shoulderY);
    ctx.rotate(dir * (-0.45 + swingAngle));
    // Stick arm
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * unitH * 0.14, -unitH * 0.08);
    ctx.stroke();
    // Sword blade
    ctx.translate(dir * unitH * 0.14, -unitH * 0.08);
    ctx.fillStyle = archetype === 'tycoon' ? (faction === 'crimson' ? '#EF4444' : '#10B981') : '#E2E8F0';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = Math.max(2, unitH * 0.015);
    ctx.beginPath();
    ctx.moveTo(-unitH * 0.035, 0);
    ctx.lineTo(0, -unitH * 0.52);
    ctx.lineTo(unitH * 0.035, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Crossguard & pommel
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-unitH * 0.09, -unitH * 0.02, unitH * 0.18, unitH * 0.04);
    ctx.strokeRect(-unitH * 0.09, -unitH * 0.02, unitH * 0.18, unitH * 0.04);
    ctx.restore();

    // Shield on off-shoulder
    const shieldW = bodyW * 0.52;
    const shieldH = bodyH * 0.62;
    ctx.save();
    ctx.translate(shieldShoulderX * 0.55, shoulderY + shieldH * 0.35);
    ctx.beginPath();
    ctx.moveTo(-shieldW / 2, -shieldH / 2);
    ctx.lineTo(shieldW / 2, -shieldH / 2);
    ctx.lineTo(shieldW / 2, 0);
    ctx.quadraticCurveTo(0, shieldH * 0.65, 0, shieldH * 0.65);
    ctx.quadraticCurveTo(-shieldW / 2, 0, -shieldW / 2, 0);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    drawFactionPattern(ctx, -shieldW / 2, -shieldH / 2, shieldW, shieldH * 1.2, faction);
    ctx.restore();
    ctx.lineWidth = Math.max(2, unitH * 0.018);
    ctx.strokeStyle = '#FACC15';
    ctx.stroke();
    ctx.restore();
  } else if (archetype === 'inquisitor' || action === 'read-scroll') {
    // Left hand holds unfurled parchment scroll with wax seal (like 1:22); right hand points wand/stick
    const gesture = Math.sin(localT * 10) * 0.2;
    ctx.beginPath();
    ctx.moveTo(rightShoulderX, shoulderY);
    ctx.lineTo(rightShoulderX + unitH * 0.22, shoulderY - unitH * 0.16 + gesture * unitH * 0.1);
    ctx.stroke();

    // Unfurled parchment scroll
    const scrollX = leftShoulderX - unitH * 0.12;
    const scrollY = shoulderY - unitH * 0.05;
    const scrollW = unitH * 0.28;
    const scrollH = unitH * 0.34;
    roundRectPath(ctx, scrollX, scrollY, scrollW, scrollH, unitH * 0.03);
    ctx.fillStyle = '#FDE68A';
    ctx.fill();
    ctx.lineWidth = Math.max(2, unitH * 0.015);
    ctx.stroke();
    // Scribble text lines on scroll
    ctx.strokeStyle = '#78350F';
    for (let l = 1; l <= 4; l++) {
      ctx.beginPath();
      ctx.moveTo(scrollX + scrollW * 0.18, scrollY + (scrollH / 5.5) * l);
      ctx.lineTo(scrollX + scrollW * 0.82, scrollY + (scrollH / 5.5) * l);
      ctx.stroke();
    }
    // Red wax seal
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(scrollX + scrollW * 0.72, scrollY + scrollH * 0.82, unitH * 0.032, 0, Math.PI * 2);
    ctx.fill();
  } else if (action === 'bow-volley' || archetype === 'squad_army') {
    // Longbow held forward with taut bowstring
    const bowX = dir * (bodyW * 0.58);
    const bowY = shoulderY + unitH * 0.02;
    ctx.beginPath();
    ctx.moveTo(dir > 0 ? rightShoulderX : leftShoulderX, shoulderY);
    ctx.lineTo(bowX, bowY);
    ctx.stroke();
    // Wooden Yew Longbow arc
    ctx.save();
    ctx.translate(bowX, bowY);
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = Math.max(2.5, unitH * 0.022);
    ctx.beginPath();
    ctx.arc(0, 0, unitH * 0.34, -Math.PI * 0.42, Math.PI * 0.42, dir < 0);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = Math.max(1, unitH * 0.01);
    const tipX = Math.cos(Math.PI * 0.42) * unitH * 0.34 * (dir > 0 ? 1 : -1);
    const tipY = Math.sin(Math.PI * 0.42) * unitH * 0.34;
    ctx.beginPath();
    ctx.moveTo(tipX, -tipY);
    ctx.lineTo(-dir * unitH * 0.08, 0);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.restore();
  } else {
    // Expressive talking / idle stick arms
    const wave = Math.sin(localT * 9) * (unitH * 0.05);
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, shoulderY);
    ctx.lineTo(leftShoulderX - unitH * 0.12, shoulderY + unitH * 0.14 - wave);
    ctx.moveTo(rightShoulderX, shoulderY);
    ctx.lineTo(rightShoulderX + unitH * 0.15, shoulderY - unitH * 0.08 + wave);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Hero Banner & Shield & Warhorse (like Joan of Arc at 0:54-0:56)
  if (archetype === 'hero_rebel' && hasArmor) {
    // Shield on chest/side
    const sw = bodyW * 0.55;
    const sh = bodyH * 0.65;
    ctx.save();
    ctx.translate(bodyW * 0.26, shoulderY + sh * 0.28);
    ctx.scale(armorScale, armorScale);
    ctx.beginPath();
    ctx.moveTo(-sw / 2, -sh / 2);
    ctx.lineTo(sw / 2, -sh / 2);
    ctx.lineTo(sw / 2, 0);
    ctx.quadraticCurveTo(0, sh * 0.65, 0, sh * 0.65);
    ctx.quadraticCurveTo(-sw / 2, 0, -sw / 2, 0);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    drawFactionPattern(ctx, -sw / 2, -sh / 2, sw, sh * 1.2, 'france');
    ctx.restore();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = Math.max(2.5, unitH * 0.018);
    ctx.stroke();
    ctx.restore();
  }

  if (archetype === 'hero_rebel' && hasBanner) {
    // Tall pole + flowing white & gold fleur-de-lis banner
    ctx.save();
    ctx.scale(bannerScale, bannerScale);
    const poleX = -bodyW * 0.42;
    const poleTopY = headY - headR * 2.15;
    const poleBotY = bodyTopY + bodyH;
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = Math.max(3.5, unitH * 0.025);
    ctx.beginPath();
    ctx.moveTo(poleX, poleBotY);
    ctx.lineTo(poleX, poleTopY);
    ctx.stroke();

    // Flowing forked pennant
    const flagW = unitH * 0.72;
    const flagH = unitH * 0.34;
    const flutter = Math.sin(localT * 8) * (unitH * 0.025);
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = Math.max(2, unitH * 0.016);
    ctx.beginPath();
    ctx.moveTo(poleX, poleTopY + unitH * 0.03);
    ctx.quadraticCurveTo(poleX + flagW * 0.5, poleTopY - flutter, poleX + flagW, poleTopY + flagH * 0.15 + flutter);
    ctx.lineTo(poleX + flagW * 0.82, poleTopY + flagH * 0.5 + flutter * 0.5);
    ctx.lineTo(poleX + flagW, poleTopY + flagH * 0.9 + flutter);
    ctx.quadraticCurveTo(poleX + flagW * 0.5, poleTopY + flagH - flutter, poleX, poleTopY + flagH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold fleur-de-lis emblems on banner
    ctx.fillStyle = '#F59E0B';
    drawMiniFleurDeLis(ctx, poleX + flagW * 0.28, poleTopY + flagH * 0.5, unitH * 0.045);
    drawMiniFleurDeLis(ctx, poleX + flagW * 0.58, poleTopY + flagH * 0.48 + flutter * 0.4, unitH * 0.045);
    ctx.restore();
  }

  if (hasHorse) {
    // Caparisoned Royal Warhorse underneath (like Joan at 0:55 & 1:02)
    ctx.save();
    ctx.translate(0, bodyTopY + bodyH * 0.78);
    ctx.scale(horseScale, horseScale);
    const hw = bodyW * 1.65;
    const hh = bodyH * 0.72;

    // Blue & Gold Fleur-de-lis caparison blanket
    roundRectPath(ctx, -hw * 0.5, -hh * 0.35, hw, hh * 0.85, unitH * 0.08);
    ctx.save();
    ctx.clip();
    drawFactionPattern(ctx, -hw * 0.5, -hh * 0.35, hw, hh * 0.85, 'france_royal');
    ctx.restore();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = Math.max(2.5, unitH * 0.018);
    ctx.stroke();

    // Horse head & armored chamfron on left
    const hx = -hw * 0.48;
    const hy = -hh * 0.32;
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(hx, hy, hw * 0.18, hh * 0.32, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Horse eye
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(hx - hw * 0.04, hy - hh * 0.06, Math.max(2, unitH * 0.015), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the ornate RPG Stat Card above a puppet (like Joan of Arc's Crown 0 | Swords 0 | Confidence 100 at 0:46).
 */
function drawRpgStatBanner(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  unitH: number,
  title: string,
  statValues: string,
  localT: number
) {
  ctx.save();
  const cardW = Math.max(unitH * 1.35, Math.min(180, unitH * 2.2));
  const cardH = unitH * 0.32;
  const x = cx - cardW / 2;
  const y = topY - cardH * 1.9;

  // Ornate parchment nameplate
  roundRectPath(ctx, x, y, cardW, cardH, cardH * 0.22);
  ctx.fillStyle = '#FEF3C7';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, unitH * 0.016);
  ctx.strokeStyle = '#B45309';
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = `800 ${Math.max(7, Math.round(cardH * 0.54))}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title || 'Joan of Arc', cx, y + cardH * 0.52, cardW * 0.92);

  // Parse stat pills (e.g. "👑 0 | ⚔️ 0 | ✊ 100")
  const rawStats = (statValues || '👑 0 | ⚔️ 0 | ✊ 100')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  const spacing = cardW / Math.max(1, rawStats.length);
  rawStats.forEach((st, idx) => {
    const staggerT = clamp01((localT - 0.25 - idx * 0.35) / 0.28);
    if (staggerT <= 0) return;
    const sc = easeOutBack(staggerT);
    const sx = x + spacing * (idx + 0.5);
    const sy = y + cardH * 1.48;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(sc, sc);

    const parts = st.split(/\s+/);
    const icon = parts[0] || '⭐';
    const val = parts.slice(1).join(' ') || '100';
    const isPositive = val.includes('100') || val.startsWith('+');

    // Icon above pill
    ctx.font = `${Math.max(8, Math.round(cardH * 0.68))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, -cardH * 0.22);

    // Value badge
    const pillW = cardH * 1.1;
    const pillH = cardH * 0.52;
    roundRectPath(ctx, -pillW / 2, cardH * 0.12, pillW, pillH, pillH * 0.45);
    ctx.fillStyle = '#F5F5F4';
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, unitH * 0.014);
    ctx.strokeStyle = isPositive ? '#16A34A' : '#DC2626';
    ctx.stroke();

    ctx.fillStyle = isPositive ? '#15803D' : '#B91C1C';
    ctx.font = `900 ${Math.max(6, Math.round(pillH * 0.68))}px sans-serif`;
    ctx.fillText(val, 0, cardH * 0.12 + pillH * 0.54);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * Draws a comic speech / callout bubble above a puppet.
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  unitH: number,
  text: string
) {
  if (!text) return;
  ctx.save();
  const fontSize = Math.max(7, Math.round(unitH * 0.11));
  ctx.font = `700 ${fontSize}px sans-serif`;
  const textW = ctx.measureText(text).width;
  const padX = fontSize * 0.9;
  const bw = Math.min(unitH * 1.8, textW + padX * 2);
  const bh = fontSize * 2.1;
  const bx = cx - bw / 2;
  const by = topY - bh - unitH * 0.12;

  roundRectPath(ctx, bx, by, bw, bh, bh * 0.35);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, unitH * 0.015);
  ctx.strokeStyle = '#111827';
  ctx.stroke();

  // Speech pointer triangle
  ctx.beginPath();
  ctx.moveTo(cx - fontSize * 0.4, by + bh - 1);
  ctx.lineTo(cx, by + bh + fontSize * 0.55);
  ctx.lineTo(cx + fontSize * 0.4, by + bh - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, by + bh * 0.52, bw - padX);
  ctx.restore();
}

/**
 * Main entrypoint called by `drawGraphics()` in `src/graphics-engine.ts`.
 */
export function drawPuppetStage(
  ctx: CanvasRenderingContext2D,
  ev: PuppetStageEvent,
  alpha: number,
  appear: number,
  cvW: number,
  cvH: number,
  time: number
) {
  const rawLocalT = Math.max(0, time - ev.start);
  const dur = Math.max(0.5, ev.end - ev.start);
  // When paused or inspecting right at ev.start (rawLocalT ~ 0, appear === 1), preview mid-scene state so RPG stats, dual bubbles, and gear upgrades are visible
  const localT = rawLocalT < 0.02 && appear >= 0.99 ? Math.max(dur * 0.68, 1.5) : rawLocalT;
  const clipProgress = clamp01(localT / dur);

  const isVertical = cvH > cvW;
  const userScale = ev.scale || 1.0;
  const baseUnitH = (isVertical ? cvW * 0.34 : cvH * 0.36) * userScale;

  let stageX = ev.customX !== undefined ? ev.customX * cvW : cvW * 0.5;
  let stageY = ev.customY !== undefined ? ev.customY * cvH : cvH * (isVertical ? 0.54 : 0.56);

  ctx.save();
  ctx.globalAlpha = alpha;

  const sc = Math.max(0.01, easeOutBack(clamp01(appear)));
  ctx.translate(stageX, stageY);
  ctx.scale(sc, sc);
  ctx.translate(-stageX, -stageY);

  const dualMode = ev.dualMode || 'single';
  const primaryId = ev.puppetId || ev.puppet || 'flag_fighter';
  const primaryFaction = ev.faction || PUPPET_ARCHETYPE_META[primaryId]?.defaultFaction || 'england';
  const primaryExpr = ev.expression || 'neutral';
  const primaryAction = ev.action || PUPPET_ARCHETYPE_META[primaryId]?.defaultAction || 'idle-bob';
  const primaryBubble = ev.bubbleText || ev.speechBubble;
  const secBubble = ev.secondaryBubbleText || ev.secondaryBubble;
  const counterText = ev.floatingCounterText || ev.floatingCounter;
  const movePath: PuppetMovementPath = ev.movementPath || 'stationary';
  const useLipSync = ev.audioLipSync !== false;

  // Compute stage movement horizontal offset & walking step bounce
  let stageMoveOffsetX = 0;
  let convergeSpread = 0;
  let walkStepBounceY = 0;

  if (movePath === 'enter-left') {
    const prog = easeOutCubic(clamp01(clipProgress / 0.35));
    stageMoveOffsetX = -(1 - prog) * cvW * 0.28;
    if (prog < 0.99) walkStepBounceY = Math.abs(Math.sin(localT * 16)) * (-baseUnitH * 0.035);
  } else if (movePath === 'enter-right') {
    const prog = easeOutCubic(clamp01(clipProgress / 0.35));
    stageMoveOffsetX = (1 - prog) * cvW * 0.28;
    if (prog < 0.99) walkStepBounceY = Math.abs(Math.sin(localT * 16)) * (-baseUnitH * 0.035);
  } else if (movePath === 'march-across') {
    stageMoveOffsetX = (clipProgress - 0.5) * cvW * 0.38;
    walkStepBounceY = Math.abs(Math.sin(localT * 15)) * (-baseUnitH * 0.03);
  } else if (movePath === 'converge-center') {
    const prog = easeOutCubic(clamp01(clipProgress / 0.38));
    convergeSpread = (1 - prog) * cvW * 0.16;
    if (prog < 0.99) walkStepBounceY = Math.abs(Math.sin(localT * 16)) * (-baseUnitH * 0.035);
  }

  stageX += stageMoveOffsetX;
  const puppetBaseY = stageY + walkStepBounceY;

  // Parse optional multi-beat dialogue script (e.g. "Left: Why not become King of France too?\nRight: Um... no.")
  let activeBeatSpeaker: 'left' | 'right' | null = null;
  let activeBeatText: string | null = null;
  if (ev.dialogueLines && ev.dialogueLines.trim()) {
    const rawLines = ev.dialogueLines
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (rawLines.length > 0) {
      const beatIdx = Math.min(rawLines.length - 1, Math.floor(clipProgress * rawLines.length));
      const rawBeat = rawLines[beatIdx];
      const rightMatch = rawBeat.match(/^(?:right|r|2|rival|b)\s*:\s*(.+)$/i);
      const leftMatch = rawBeat.match(/^(?:left|l|1|primary|a)\s*:\s*(.+)$/i);
      if (rightMatch) {
        activeBeatSpeaker = 'right';
        activeBeatText = rightMatch[1].trim();
      } else if (leftMatch) {
        activeBeatSpeaker = 'left';
        activeBeatText = leftMatch[1].trim();
      } else {
        activeBeatSpeaker = beatIdx % 2 === 1 && dualMode !== 'single' ? 'right' : 'left';
        activeBeatText = rawBeat;
      }
    }
  }

  // Compute deterministic lip-sync mouth energy from speech cadence
  const baseSpeechCadence = useLipSync
    ? clamp01(0.45 + 0.45 * Math.sin(localT * 15.5) * Math.cos(localT * 6.3))
    : 0;
  const leftLipEnergy =
    activeBeatSpeaker === 'left'
      ? Math.max(0.25, baseSpeechCadence)
      : activeBeatSpeaker === 'right'
        ? 0
        : primaryBubble && (!secBubble || clipProgress < 0.45)
          ? baseSpeechCadence
          : 0;
  const rightLipEnergy =
    activeBeatSpeaker === 'right'
      ? Math.max(0.25, baseSpeechCadence)
      : activeBeatSpeaker === 'left'
        ? 0
        : secBubble && clipProgress >= 0.42
          ? baseSpeechCadence
          : 0;

  if (primaryId === 'squad_army' && dualMode === 'single') {
    // Multi-Unit Formation (e.g. 4 English Longbowmen firing arrow volleys or charging knights)
    const offsets = [
      [-baseUnitH * 0.58, baseUnitH * 0.08],
      [-baseUnitH * 0.2, -baseUnitH * 0.06],
      [baseUnitH * 0.2, baseUnitH * 0.1],
      [baseUnitH * 0.56, -baseUnitH * 0.04],
    ];
    const marchShift = primaryAction === 'cavalry-charge' ? (clipProgress - 0.5) * cvW * 0.28 : 0;

    for (let i = 0; i < offsets.length; i++) {
      const [ox, oy] = offsets[i];
      drawSinglePuppet(
        ctx,
        'squad_army',
        primaryFaction,
        primaryExpr,
        primaryAction,
        localT + i * 0.18,
        clipProgress,
        stageX + ox + marchShift,
        puppetBaseY + oy,
        baseUnitH * 0.72,
        true,
        leftLipEnergy
      );
    }

    // Animated parabolic arrow volley rain when action === 'bow-volley' (like 0:25-0:28)
    if (primaryAction === 'bow-volley') {
      ctx.save();
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = Math.max(2, baseUnitH * 0.014);
      for (let a = 0; a < 9; a++) {
        const arrowProg = ((localT * 1.35 + a * 0.14) % 1.0);
        const ax = stageX - baseUnitH * 0.4 + arrowProg * (cvW * 0.55);
        const ay = puppetBaseY - Math.sin(arrowProg * Math.PI) * (baseUnitH * 0.95) - (a % 3) * (baseUnitH * 0.12);
        const angle = Math.atan2(-Math.cos(arrowProg * Math.PI) * 0.9, 1);

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-baseUnitH * 0.12, 0);
        ctx.lineTo(baseUnitH * 0.12, 0);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(baseUnitH * 0.15, 0);
        ctx.lineTo(baseUnitH * 0.09, -baseUnitH * 0.025);
        ctx.lineTo(baseUnitH * 0.09, baseUnitH * 0.025);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    const squadBubble = activeBeatText || primaryBubble;
    if (squadBubble) {
      drawSpeechBubble(ctx, stageX, puppetBaseY - baseUnitH * 0.48, baseUnitH * 0.85, squadBubble);
    }
  } else if (dualMode !== 'single') {
    // Dual-Puppet Rivalry / Dialogue / Trial Scene
    const sep = (dualMode === 'duel-clash' ? baseUnitH * 0.44 : baseUnitH * 0.72) + convergeSpread;
    const leftX = stageX - sep;
    const rightX = stageX + sep;

    const secId = ev.secondaryPuppetId || ev.secondaryPuppet || (dualMode === 'trial-scene' ? 'hero_rebel' : primaryId);
    const secFaction = ev.secondaryFaction || (primaryFaction === 'england' ? 'france' : 'england');
    const secExpr = ev.secondaryExpression || 'angry';

    if (dualMode === 'trial-scene') {
      // Wooden stake behind left captive puppet (like Joan at the stake at 1:19-1:28)
      ctx.save();
      ctx.fillStyle = '#451A03';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 3;
      ctx.fillRect(leftX - baseUnitH * 0.07, puppetBaseY - baseUnitH * 0.65, baseUnitH * 0.14, baseUnitH * 1.05);
      ctx.strokeRect(leftX - baseUnitH * 0.07, puppetBaseY - baseUnitH * 0.65, baseUnitH * 0.14, baseUnitH * 1.05);
      ctx.restore();

      drawSinglePuppet(ctx, secId, secFaction, secExpr, 'idle-bob', localT, 0.35, leftX, puppetBaseY - baseUnitH * 0.06, baseUnitH * 0.88, true, rightLipEnergy);
      drawSinglePuppet(ctx, primaryId, primaryFaction, primaryExpr, 'read-scroll', localT, clipProgress, rightX, puppetBaseY, baseUnitH * 0.88, false, leftLipEnergy);

      // Rising fire embers at base of stake (like 1:28-1:30)
      for (let f = 0; f < 10; f++) {
        const fp = (localT * 1.4 + f * 0.13) % 1;
        const fx = leftX + Math.sin(f * 2.1 + localT * 5) * (baseUnitH * 0.35);
        const fy = puppetBaseY + baseUnitH * 0.38 - fp * (baseUnitH * 0.75);
        const fr = (1 - fp) * (baseUnitH * 0.09);
        ctx.fillStyle = fp < 0.45 ? 'rgba(250, 204, 21, 0.85)' : 'rgba(239, 68, 68, 0.75)';
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Duel Clash or Dialogue Versus
      drawSinglePuppet(ctx, primaryId, primaryFaction, primaryExpr, primaryAction, localT, clipProgress, leftX, puppetBaseY, baseUnitH * 0.9, true, leftLipEnergy);
      drawSinglePuppet(
        ctx,
        secId,
        secFaction,
        secExpr,
        dualMode === 'duel-clash' ? 'sword-clash' : 'idle-bob',
        localT + 0.25,
        clipProgress,
        rightX,
        puppetBaseY,
        baseUnitH * 0.9,
        false,
        rightLipEnergy
      );

      // Metallic sword clash sparks in the middle when duel-clash is active (like 0:02-0:08)
      if (dualMode === 'duel-clash' && convergeSpread < baseUnitH * 0.15) {
        const sparkPulse = Math.abs(Math.sin(localT * 15));
        if (sparkPulse > 0.55) {
          ctx.save();
          ctx.translate(stageX, puppetBaseY - baseUnitH * 0.16);
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = Math.max(2.5, baseUnitH * 0.018);
          for (let s = 0; s < 6; s++) {
            const ang = (s * Math.PI) / 3 + localT * 4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * baseUnitH * 0.04, Math.sin(ang) * baseUnitH * 0.04);
            ctx.lineTo(Math.cos(ang) * baseUnitH * 0.14, Math.sin(ang) * baseUnitH * 0.14);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    if (activeBeatText) {
      const bubbleX =
        activeBeatSpeaker === 'right'
          ? dualMode === 'trial-scene'
            ? leftX
            : rightX
          : dualMode === 'trial-scene'
            ? rightX
            : leftX;
      drawSpeechBubble(ctx, bubbleX, puppetBaseY - baseUnitH * 0.52, baseUnitH * 0.85, activeBeatText);
    } else {
      if (primaryBubble) {
        drawSpeechBubble(ctx, dualMode === 'trial-scene' ? rightX : leftX, puppetBaseY - baseUnitH * 0.52, baseUnitH * 0.85, primaryBubble);
      }
      if (secBubble && clipProgress >= 0.42) {
        drawSpeechBubble(ctx, rightX, puppetBaseY - baseUnitH * 0.52, baseUnitH * 0.85, secBubble);
      }
    }
  } else {
    // Single Hero / Monarch / Storyteller / Tycoon Stage
    drawSinglePuppet(ctx, primaryId, primaryFaction, primaryExpr, primaryAction, localT, clipProgress, stageX, puppetBaseY, baseUnitH, movePath !== 'enter-right', leftLipEnergy);

    const singleBubble = activeBeatText || primaryBubble;
    if (singleBubble) {
      drawSpeechBubble(ctx, stageX, puppetBaseY - baseUnitH * (ev.showRpgStats ? 0.95 : 0.55), baseUnitH * 0.9, singleBubble);
    }
  }

  // Optional RPG Stat Card above stage (like Joan of Arc 0:46)
  if (ev.showRpgStats) {
    drawRpgStatBanner(
      ctx,
      stageX,
      stageY - baseUnitH * 0.46,
      baseUnitH,
      ev.title || 'Joan of Arc',
      ev.statValues || '👑 0 | ⚔️ 0 | ✊ 100',
      localT
    );
  }

  // Optional Floating Counter / Year Callout / +1 Victory Laurel (like "103 -> 116 years" at 0:05 or "+1" at 1:03)
  if (counterText) {
    ctx.save();
    const floatY = stageY - baseUnitH * (ev.showRpgStats ? 1.18 : 0.72) - Math.sin(localT * 4) * (baseUnitH * 0.03);
    const isPlusOne = counterText.trim().startsWith('+');
    const fontSize = Math.round(baseUnitH * (isPlusOne ? 0.24 : 0.28));

    ctx.font = `900 ${fontSize}px Impact, Montserrat, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(5, fontSize * 0.16);
    ctx.strokeStyle = isPlusOne ? '#064E3B' : '#111827';
    ctx.fillStyle = isPlusOne ? '#4ADE80' : '#FACC15';

    // If counter contains a number like "116 years", animate counting up from ~85% to 100%
    let displayCounter = counterText;
    const numMatch = displayCounter.match(/^(\d+)(\s+.*)$/);
    if (numMatch && !isPlusOne) {
      const targetNum = parseInt(numMatch[1], 10);
      const startNum = Math.max(1, Math.floor(targetNum * 0.85));
      const curNum = Math.round(startNum + (targetNum - startNum) * clamp01(clipProgress * 1.3));
      displayCounter = `${curNum}${numMatch[2]}`;
    }

    ctx.strokeText(displayCounter, stageX, floatY);
    ctx.fillText(displayCounter, stageX, floatY);
    ctx.restore();
  }

  ctx.restore();
}
