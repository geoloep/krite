import { IContainer } from '../types';
import { RactiveApp } from '../apps/ractiveApp';
export declare class ContainerService implements IContainer {
    private wide;
    private narrow;
    private app;
    constructor(wide: string | IContainer, narrow: string | IContainer);
    register(app: RactiveApp): void;
    deregister(): void;
    private onStateChange;
}
