import { RactiveApp } from '../apps/ractiveApp';
import { IContainer } from '../types';
export interface IApps {
    [index: string]: SidebarServiceApp;
}
export interface ISidebarCallback {
    (): void;
}
export declare class SidebarServiceApp implements IContainer {
    readonly name: string;
    readonly label: string;
    readonly icon: string;
    app: RactiveApp;
    constructor(name: string, label: string, icon: string);
    register(app: RactiveApp): void;
    deregister(): void;
}
export declare class SidebarService {
    readonly target: string;
    apps: IApps;
    activeApp: SidebarServiceApp;
    activeName: string;
    private onChangeCallbacks;
    constructor(target?: string);
    addApp(app: SidebarServiceApp): SidebarServiceApp;
    setApp(appName: string): void;
    registerOnChange(func: () => void): void;
    private onChange();
}
