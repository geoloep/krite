import { IDataSource } from '../types';
export declare class SourceService {
    sources: {
        [index: string]: IDataSource;
    };
    sourceList: string[];
    add(name: string, source: IDataSource): void;
}
