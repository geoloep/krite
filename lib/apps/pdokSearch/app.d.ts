import { RactiveApp } from '../ractiveApp';
import { MapService } from '../../services/map';
import { PdokLocatieserverService } from '../../services/pdokLocatieserver';
import { IContainer } from '../../types';
export declare class PdokSearchApp extends RactiveApp {
    protected map: MapService;
    protected locatieserver: PdokLocatieserverService;
    protected searchTimeOut: number;
    protected timeOutLength: number;
    protected diepteNaarZoom: {
        [index: string]: number;
    };
    protected depthOrder: string[];
    constructor(element?: IContainer | string);
    protected createRactive(element: string): void;
    protected search: (searchString: string) => void;
    protected searchClick(context: any): void;
    protected searchSuccess: (data: any) => void;
    protected searchFail: () => void;
    protected selectDown: () => void;
    protected selectReset(): void;
    protected selectUp: () => void;
}
