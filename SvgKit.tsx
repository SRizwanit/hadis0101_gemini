import React from 'react';
import {COLORS, getLayout, getUnit} from './theme';
import {DEFAULT_BAND_OPACITY} from './svg-data';

export const SVG_LOOK = {
  captionBandOpacity: DEFAULT_BAND_OPACITY,
  featherPx: 60,
  glow: {soft: 0.3, normal: 0.5, strong: 0.78},
  lineWidth: {hair: 1.5, thin: 2.5, base: 4, bold: 6},
  pop: {from: 0.6, overshoot: 0.08, durationSec: 0.35, peakAt: 0.55, fadeInSec: 0.12},
  sparkle: {sizeMin: 5, sizeMax: 13, periodMin: 1.6, periodMax: 3.6, sharpness: 2},
  guides: {art: 'rgba(31,163,74,0.35)', band: 'rgba(224,184,92,0.4)', popup: 'rgba(108,203,255,0.4)'},
};

export const LESSON_SIZE_FACTOR = 0.92;

export interface SVG_GEOMETRY_DEF {
  headerBottom: number;
  artTop: number;
  artBottom: number;
  captionTop: number;
  captionBottom: number;
  popupTop: number;
  popupBottom: number;
  stripTop: number;
  stripBottom: number;
}

export const SVG_GEOMETRY: Record<'16x9' | '9x16', SVG_GEOMETRY_DEF> = {
  '16x9': {
    headerBottom: 359,
    artTop: 380,
    artBottom: 1010,
    captionTop: 588.8,
    captionBottom: 851.2,
    popupTop: 392,
    popupBottom: 560,
    stripTop: 860,
    stripBottom: 1010,
  },
  '9x16': {
    headerBottom: 633,
    artTop: 650,
    artBottom: 1620,
    captionTop: 936,
    captionBottom: 1324,
    popupTop: 665,
    popupBottom: 900,
    stripTop: 1340,
    stripBottom: 1620,
  },
};

export interface Zone {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

export type ZoneSet = Record<'artZone' | 'skyZone' | 'groundZone' | 'captionBand' | 'popupZone' | 'stripZone', Zone>;

export function zonesOf(width: number, height: number): ZoneSet {
  const isPortrait = height > width;
  const geom = isPortrait ? SVG_GEOMETRY['9x16'] : SVG_GEOMETRY['16x9'];

  const make = (top: number, bottom: number): Zone => ({
    left: 0,
    top,
    right: width,
    bottom,
    width,
    height: bottom - top,
    cx: width / 2,
    cy: (top + bottom) / 2,
  });

  return {
    artZone: make(geom.artTop, geom.artBottom),
    skyZone: make(geom.artTop, geom.captionTop),
    groundZone: make(geom.captionBottom, geom.artBottom),
    captionBand: make(geom.captionTop, geom.captionBottom),
    popupZone: make(geom.popupTop, geom.popupBottom),
    stripZone: make(geom.stripTop, geom.stripBottom),
  };
}

export function artPoint(zone: Zone, fx: number, fy: number): {x: number; y: number} {
  return {
    x: zone.left + zone.width * fx,
    y: zone.top + zone.height * fy,
  };
}

export function px(val: number, unit = 1): number {
  return val * unit;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function clamp01(val: number): number {
  return clamp(val, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  if (e0 >= e1) return x >= e1 ? 1 : 0;
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function rangeProgress(x: number, start: number, end: number): number {
  if (end <= start) return x >= start ? 1 : 0;
  return clamp01((x - start) / (end - start));
}

export function localClamp(sec: number): number {
  return Math.max(-0.25, sec);
}

export function drawOn(length: number, p: number) {
  const cp = clamp01(p);
  const offset = length * (1 - cp);
  return {
    strokeDasharray: length,
    strokeDashoffset: offset,
    strokeOpacity: cp > 0 ? 1 : 0,
  };
}

export function popIn(sec: number, startSec: number, opts: {durationSec?: number; from?: number; overshoot?: number} = {}): number {
  if (sec < startSec) return 0;
  const dur = opts.durationSec ?? SVG_LOOK.pop.durationSec;
  const from = opts.from ?? SVG_LOOK.pop.from;
  const over = opts.overshoot ?? SVG_LOOK.pop.overshoot;
  const local = sec - startSec;
  if (local >= dur) return 1;

  const p = local / dur;
  const peak = SVG_LOOK.pop.peakAt;
  if (p < peak) {
    const tp = p / peak;
    return lerp(from, 1 + over, easeOutCubic(tp));
  } else {
    const tp = (p - peak) / (1 - peak);
    return lerp(1 + over, 1, easeInOutCubic(tp));
  }
}

export function popOpacity(sec: number, startSec: number, fadeIn = SVG_LOOK.pop.fadeInSec): number {
  if (sec < startSec) return 0;
  return clamp01((sec - startSec) / fadeIn);
}

export function pulse(sec: number, periodSec: number, phase = 0): number {
  return (Math.sin((sec + phase) * (Math.PI * 2 / periodSec)) + 1) / 2;
}

export function wave(sec: number, periodSec: number): number {
  return Math.sin(sec * (Math.PI * 2 / periodSec));
}

export function svgId(prefix: string, name: string): string {
  return `${prefix}-${name}`;
}

export function bandMaskStops(width: number, height: number, bandOpacity: number, featherPx = SVG_LOOK.featherPx) {
  const z = zonesOf(width, height);
  const top = z.captionBand.top;
  const bottom = z.captionBand.bottom;

  const t1 = Math.max(0, (top - featherPx) / height);
  const t2 = Math.max(0, top / height);
  const b1 = Math.min(1, bottom / height);
  const b2 = Math.min(1, (bottom + featherPx) / height);

  const o = Math.round((1 - bandOpacity) * 255);

  return [
    {offset: '0%', gray: 255},
    {offset: `${t1 * 100}%`, gray: 255},
    {offset: `${t2 * 100}%`, gray: o},
    {offset: `${b1 * 100}%`, gray: o},
    {offset: `${b2 * 100}%`, gray: 255},
    {offset: '100%', gray: 255},
  ];
}

export interface SceneProps {
  localSec: number;
  sec: number;
  width: number;
  height: number;
  idPrefix?: string;
}

export interface SceneFrameProps {
  width: number;
  height: number;
  opacity: number;
  bandOpacity?: number;
  featherPx?: number;
  idPrefix?: string;
  guides?: boolean;
  children: React.ReactNode;
}

export const SceneFrame: React.FC<SceneFrameProps> = ({
  width,
  height,
  opacity,
  bandOpacity = SVG_LOOK.captionBandOpacity,
  featherPx = SVG_LOOK.featherPx,
  idPrefix = 'sf',
  guides = false,
  children,
}) => {
  if (opacity <= 0) return null;

  const maskId = svgId(idPrefix, 'band-mask');
  const gradId = svgId(idPrefix, 'band-grad');
  const stops = bandMaskStops(width, height, bandOpacity, featherPx);
  const z = zonesOf(width, height);

  const useMask = bandOpacity < 1;

  return (
    <svg
      data-part="scene-frame"
      data-scene
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <defs>
        {useMask && (
          <>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              {stops.map((s, idx) => (
                <stop key={idx} offset={s.offset} stopColor={`rgb(${s.gray},${s.gray},${s.gray})`} />
              ))}
            </linearGradient>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width={width} height={height} fill={`url(#${gradId})`} />
            </mask>
          </>
        )}
      </defs>

      {guides && <SvgGuides width={width} height={height} />}

      <g mask={useMask ? `url(#${maskId})` : undefined}>{children}</g>
    </svg>
  );
};

export interface GlowProps {
  id: string;
  cx: number;
  cy: number;
  r: number;
  ratio?: number;
  color?: string;
  intensity?: number;
  opacity?: number;
}

export const Glow: React.FC<GlowProps> = ({
  id,
  cx,
  cy,
  r,
  ratio = 1,
  color = COLORS.gold,
  intensity = SVG_LOOK.glow.normal,
  opacity = 1,
}) => {
  if (r <= 0 || opacity <= 0 || intensity <= 0) return null;
  const gradId = `${id}-glow`;

  return (
    <>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={intensity * opacity} />
          <stop offset="50%" stopColor={color} stopOpacity={(intensity * opacity) / 3} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * ratio} fill={`url(#${gradId})`} />
    </>
  );
};

export interface Sparkle {
  x: number;
  y: number;
  size: number;
  phase: number;
  period: number;
}

export function starPath(size: number): string {
  return `M0,-${size} Q0,0 ${size},0 Q0,0 0,${size} Q0,0 -${size},0 Q0,0 0,-{size} Z`;
}

export function makeSparkles(seed: number, count: number, zone: Zone): Sparkle[] {
  const rng = (function*(s) {
    let x = s;
    while (true) {
      x = (x * 16807) % 2147483647;
      yield (x - 1) / 2147483646;
    }
  })(seed);

  const list: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    const rx = rng.next().value as number;
    const ry = rng.next().value as number;
    const rs = rng.next().value as number;
    const rp = rng.next().value as number;
    list.push({
      x: zone.left + rx * zone.width,
      y: zone.top + ry * zone.height,
      size: SVG_LOOK.sparkle.sizeMin + rs * (SVG_LOOK.sparkle.sizeMax - SVG_LOOK.sparkle.sizeMin),
      phase: rp * Math.PI * 2,
      period: SVG_LOOK.sparkle.periodMin + (rng.next().value as number) * (SVG_LOOK.sparkle.periodMax - SVG_LOOK.sparkle.periodMin),
    });
  }
  return list;
}

export interface SparklesProps {
  seed: number;
  count: number;
  zone: Zone;
  sec: number;
  color?: string;
  opacity?: number;
}

export const Sparkles: React.FC<SparklesProps> = ({
  seed,
  count,
  zone,
  sec,
  color = COLORS.goldSoft,
  opacity = 1,
}) => {
  const sparkles = React.useMemo(() => makeSparkles(seed, count, zone), [seed, count, zone]);
  if (opacity <= 0 || count <= 0) return null;

  return (
    <g>
      {sparkles.map((s, idx) => {
        const alpha = 0.2 + (Math.sin(sec * (Math.PI * 2 / s.period) + s.phase) + 1) * 0.4;
        return (
          <path
            key={idx}
            d={`M ${s.x} ${s.y - s.size} Q ${s.x} ${s.y} ${s.x + s.size} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y + s.size} Q ${s.x} ${s.y} ${s.x - s.size} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y - s.size} Z`}
            fill={color}
            opacity={alpha * opacity}
          />
        );
      })}
    </g>
  );
};

export const SvgGuides: React.FC<{width: number; height: number}> = ({width, height}) => {
  const z = zonesOf(width, height);
  return (
    <g opacity={0.6} pointerEvents="none">
      <rect x={z.artZone.left} y={z.artZone.top} width={z.artZone.width} height={z.artZone.height} fill="none" stroke={SVG_LOOK.guides.art} strokeWidth="2" strokeDasharray="6 6" />
      <rect x={z.captionBand.left} y={z.captionBand.top} width={z.captionBand.width} height={z.captionBand.height} fill={SVG_LOOK.guides.band} opacity={0.25} />
      <rect x={z.captionBand.left} y={z.captionBand.top} width={z.captionBand.width} height={z.captionBand.height} fill="none" stroke={SVG_LOOK.guides.band} strokeWidth="2" />
      <rect x={z.popupZone.left} y={z.popupZone.top} width={z.popupZone.width} height={z.popupZone.height} fill="none" stroke={SVG_LOOK.guides.popup} strokeWidth="2" strokeDasharray="4 4" />
    </g>
  );
};
