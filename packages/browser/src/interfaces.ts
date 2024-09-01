interface LmBrowserProviderParams {
    name: string;
    onToken?: (t: string) => void;
    onStartEmit?: (data?: any) => void;
    onError?: (err: string) => void;
}

interface OnLoadProgressBasic {
    total: number;
    loaded: number;
}

interface OnLoadProgressFull extends OnLoadProgressBasic {
    percent: number;
}

type OnLoadProgress = (data: OnLoadProgressFull) => void;
type BasicOnLoadProgress = (data: OnLoadProgressBasic) => void;

export {
    OnLoadProgress,
    OnLoadProgressBasic,
    OnLoadProgressFull,
    BasicOnLoadProgress,
    LmBrowserProviderParams,
}