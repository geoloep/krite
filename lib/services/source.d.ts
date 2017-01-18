import { IDataSource } from '../types';
export declare class SourceService {
    sources: {
        [index: string]: IDataSource;
    };
    sourceList: string[];
    add<T extends IDataSource>(name: string, source: T): T;
}
