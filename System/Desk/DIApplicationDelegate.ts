import { Application } from "../Secretary";

export interface DIApplicationDelegate {
    init: (app: Application) => void;
    serverScript: (str: string) => void;
}
