import {Composition, getAudioDurationInSeconds} from 'remotion';
import {HadisVideo, HadisVideoProps} from './HadisVideo';
import {AUDIO_SECONDS_FALLBACK, FORMATS, FALLBACK_DURATION_FRAMES, calcDurationInFrames} from './config';
import wav from './hadis0101.wav';

export const sanitizeAudioSec = (val: unknown): number => {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num) || num <= 0) return AUDIO_SECONDS_FALLBACK;
  return num;
};

export function metadataFor(audioSec: number, baseProps: HadisVideoProps, fps = 30) {
  const safeSec = sanitizeAudioSec(audioSec);
  const durationInFrames = calcDurationInFrames(safeSec, 5, fps);
  return {
    durationInFrames,
    props: {
      ...baseProps,
      audioSec: safeSec,
    },
  };
}

export const calculateHadisMetadata = async ({props}: {props: HadisVideoProps}) => {
  try {
    const dur = await getAudioDurationInSeconds(wav);
    return metadataFor(dur, props);
  } catch (err) {
    console.warn('Failed to get audio duration via Remotion, using fallback:', err);
    return metadataFor(AUDIO_SECONDS_FALLBACK, props);
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={FORMATS['16x9'].id}
        component={HadisVideo}
        durationInFrames={FALLBACK_DURATION_FRAMES}
        fps={30}
        width={FORMATS['16x9'].width}
        height={FORMATS['16x9'].height}
        defaultProps={{format: '16x9', audioSec: AUDIO_SECONDS_FALLBACK}}
        calculateMetadata={calculateHadisMetadata}
      />
      <Composition
        id={FORMATS['9x16'].id}
        component={HadisVideo}
        durationInFrames={FALLBACK_DURATION_FRAMES}
        fps={30}
        width={FORMATS['9x16'].width}
        height={FORMATS['9x16'].height}
        defaultProps={{format: '9x16', audioSec: AUDIO_SECONDS_FALLBACK}}
        calculateMetadata={calculateHadisMetadata}
      />
    </>
  );
};
