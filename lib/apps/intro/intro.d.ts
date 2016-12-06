import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class IntroApp extends RactiveApp {
    readonly element: IContainer | string;
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
}
