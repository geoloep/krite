export declare class GeocodeService {
    readonly baseurl: string;
    constructor(baseurl: string);
    search(searchString: string): Promise<any>;
}
