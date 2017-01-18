import { IDataSource } from '../types';

export class SourceService {
    sources: { [index: string]: IDataSource } = {};
    sourceList: string[] = [];

    add<T extends IDataSource>(name: string, source: T): T {
        this.sources[name] = source;
        this.sourceList.push(name);
        return source;
    };
}
