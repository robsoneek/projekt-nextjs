import { BlockList } from "net";
import { DecodeError } from "next/dist/shared/lib/utils";
import { decode } from "punycode";
import { blob } from "stream/consumers";

export async function fetchAndDecodeAudio(url: string, context: BaseAudioContext) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

export async function exportBeatToWav(patterns: boolean[][][],
    activePatternIndex: number,
    trackUrls: string[], bpm: number, volumes: number[], mutes: boolean[]
) {
    const secondPerStep = (60/bpm) / 4;
    const totalSteps = 16;
    const totalDurationSeconds = (totalSteps * secondPerStep) + 1.0;
    const sampleRate = 44100;

    const offlineCtx = new OfflineAudioContext(
        2,
        sampleRate * totalDurationSeconds,
        sampleRate
    );

    console.log("downloading audio samples...");

    const decodedBuffers = await Promise.all(
        trackUrls.map(url => {
            if(!url)
                return Promise.resolve(null);
            return fetchAndDecodeAudio(url, offlineCtx)
        })
    );

    console.log('successfully decoded buffers: ', decodedBuffers);
    console.log('putting notes on the timeline..');

    const activePattern = patterns[activePatternIndex];

    activePattern.forEach((track, trackIndex) => {
        if(mutes[trackIndex] || !decodedBuffers[trackIndex])
            return;
        track.forEach((isStepActive, stepIndex) => {
            if(isStepActive){
                const startTime = stepIndex * secondPerStep;
                const source = offlineCtx.createBufferSource();
                source.buffer = decodedBuffers[trackIndex];
                const gainNode = offlineCtx.createGain();
                gainNode.gain.value = volumes[trackIndex];
                source.connect(gainNode);
                gainNode.connect(offlineCtx.destination)
                source.start(startTime);
            }
        });
    });

    console.log('rendering audio...');

    const renderedBuffer = await offlineCtx.startRendering();
    const wavData = audioBufferToWav(renderedBuffer);
    const blob = new Blob([new DataView(wavData)], { type: 'audio/wav'});
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "MyBeat.wav"
    downloadLink.click();
    console.log('export complete!');
}

function audioBufferToWav(buffer: AudioBuffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let sample;
  let offset = 0;
  let pos = 0;

  // Write WAV Header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // Interleave audio channels together
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      // Interleave and clamp values
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      // Convert 32-bit float to 16-bit int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return bufferArray;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}