import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import wav from './hadis0101.wav';
import {AUDIO_SECONDS_FALLBACK, audioEndFrame} from './config';
import {Background} from './Background';
import {Header} from './Header';
import {ArabicBlock} from './ArabicBlock';
import {Karaoke} from './Karaoke';
import {ProgressBar} from './ProgressBar';
import {Outro, previousLayersOpacity} from './Outro';
import {FormatKey} from './theme';

export const HADIS_VIDEO = {
  introFadeFrames: 5,
  audioVolume: 1.0,
};

export interface HadisVideoProps {
  format: FormatKey;
  audioSec?: number;
}

export function introOpacity(frame: number, fadeFrames = HADIS_VIDEO.introFadeFrames): number {
  if (frame >= fadeFrames) return 1;
  return interpolate(frame, [0, fadeFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
}

export function outroTiming(audioSec: number, durationInFrames: number, fps: number) {
  const audioEnd = audioEndFrame(audioSec, fps);
  const outroFrames = Math.max(0, durationInFrames - audioEnd);
  return {audioEnd, outroFrames};
}

export const HadisVideo: React.FC<HadisVideoProps> = ({format, audioSec = AUDIO_SECONDS_FALLBACK}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  const isPortrait = height > width;
  const expectedFormat: FormatKey = isPortrait ? '9x16' : '16x9';
  if (format && format !== expectedFormat) {
    throw new Error(`HadisVideo: format mismatch. Composition expects format '${expectedFormat}' but received '${format}'`);
  }

  const {audioEnd, outroFrames} = outroTiming(audioSec, useVideoConfig().durationInFrames, fps);
  const secSinceAudioEnd = (frame - audioEnd) / fps;
  const prevOp = previousLayersOpacity(secSinceAudioEnd);
  const introOp = introOpacity(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#052E21'}}>
      <Audio src={wav} volume={HADIS_VIDEO.audioVolume} />
      <Background />

      <div style={{position: 'absolute', inset: 0, opacity: introOp * prevOp}}>
        <Header />
        <ArabicBlock />
        <Karaoke holdLastPage />
        <ProgressBar audioSec={audioSec} />
      </div>

      {outroFrames > 0 && (
        <Sequence from={audioEnd} durationInFrames={outroFrames} name="Outro">
          <Outro />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
