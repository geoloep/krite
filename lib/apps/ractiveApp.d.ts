/// <reference types="ractive" />
import { IContainer } from '../types';
/**
 * All apps should extend from this class
 */
export declare class RactiveApp {
    protected ractive: Ractive.Ractive;
    protected container: IContainer;
    init(element: IContainer | string | undefined): void;
    insert(element: IContainer | string | undefined): void;
    detatch(): void;
    protected createRactive(element: string): void;
}
