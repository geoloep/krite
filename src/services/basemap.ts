import { IBasemap } from '../types';

export class BasemapService {
    list: IBasemap[] = [];

    constructor(basemaps: IBasemap[]) {
        this.list = basemaps;
    }

}
