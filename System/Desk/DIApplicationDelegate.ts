export interface DIApplicationDelegate {
    init: () => void;
    serverScript: (str: string) => void;
}
