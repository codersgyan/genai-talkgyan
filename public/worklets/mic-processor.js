class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    if (!inputs.length) return true;

    const input = inputs[0]; // mono channel
    if (!input.length) return true;

    const channelData = input[0];

    // copy buffer for reuse
    const pcm = new Float32Array(channelData.length);
    pcm.set(channelData);

    this.port.postMessage(pcm);
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
