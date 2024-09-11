import { AssetsPathConfig } from '@wllama/wllama';

import wllamaSingleJS from '@wllama/wllama/src/single-thread/wllama.js?url';
import wllamaSingle from '@wllama/wllama/src/single-thread/wllama.wasm?url';
import wllamaMultiJS from '@wllama/wllama/src/multi-thread/wllama.js?url';
import wllamaMulti from '@wllama/wllama/src/multi-thread/wllama.wasm?url';
import wllamaMultiWorker from '@wllama/wllama/src/multi-thread/wllama.worker.mjs?url';

const wllamaConf: AssetsPathConfig = {
    'single-thread/wllama.js': wllamaSingleJS,
    'single-thread/wllama.wasm': wllamaSingle,
    'multi-thread/wllama.js': wllamaMultiJS,
    'multi-thread/wllama.wasm': wllamaMulti,
    'multi-thread/wllama.worker.mjs': wllamaMultiWorker,
};

export {
    wllamaConf
}