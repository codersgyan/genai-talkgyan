export function createPCMBlob(data: Float32Array) {
  // 16bit = 65546 -32768 -> 32767 -1.0 -> 1.0
  // 0.23334445555 = 0
  // 1.3434344334 => 1
  // [-1, 1]

  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    //clamp
    const element = Math.max(-1, Math.min(1, data[i]));

    int16[i] =
      element < 0 ? element * 32768 : element * 32767;
  }

  return {
    data: arrayBufferToBase64(int16),
    mimeType: "audio/pcm;rate=16000",
  };
}

function arrayBufferToBase64(data: Int16Array) {
  const bytes = new Uint8Array(data.buffer);

  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  return btoa(str);
}

export function base64ToUint8Array(
  base64: string,
): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(
    numChannels,
    frameCount,
    sampleRate,
  );

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] =
        dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
