import { obfuscateText, ObfuscationParams } from '../core';

self.onmessage = (e: MessageEvent<ObfuscationParams>) => {
  try {
    const result = obfuscateText(e.data);
    self.postMessage({ type: 'SUCCESS', result });
  } catch (err: unknown) {
    const error = err as Error;
    self.postMessage({ type: 'ERROR', error: error.message });
  }
};
