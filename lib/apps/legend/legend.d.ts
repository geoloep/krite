import { RactiveApp } from '../ractiveApp';
import { IContainer } from '../../types';
export declare class LegendApp extends RactiveApp {
    readonly element: IContainer | string;
    private map;
    private inspector;
    private sidebar;
    private buttonStates;
    private legendState;
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
    private bindButtons(layerName);
}
