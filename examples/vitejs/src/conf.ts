import { AssetsPathConfig } from '@wllama/wllama';

import wllamaSingle from '@wllama/wllama/src/single-thread/wllama.wasm?url';
import wllamaMulti from '@wllama/wllama/src/multi-thread/wllama.wasm?url';

const wllamaConf: AssetsPathConfig = {
    'single-thread/wllama.wasm': wllamaSingle,
    'multi-thread/wllama.wasm': wllamaMulti,
};

export {
    wllamaConf
}