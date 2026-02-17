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

    return {
      data: arrayBufferToBase64(int16),
      mimeType: "audio/pcm;rate=16000",
    };
  }
}

function arrayBufferToBase64(data: Int16Array) {
  const bytes = new Uint8Array(data.buffer);

  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  return btoa(str);
}
