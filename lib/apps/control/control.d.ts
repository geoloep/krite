import { RactiveApp } from '../ractiveApp';
import { SidebarService } from '../../services/sidebar';
import { IContainer } from '../../types';
export declare class ControlApp extends RactiveApp {
    readonly element: IContainer | string;
    service: SidebarService;
    constructor(element?: IContainer | string);
    onChange: () => void;
    protected createRactive(element: string): void;
    private activate;
}
