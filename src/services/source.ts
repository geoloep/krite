import { IDataSource } from '../types';

export class SourceService {
    sources: { [index: string]: IDataSource } = {};
    sourceList: string[] = [];

    add(name: string, source: IDataSource) {
        this.sources[name] = source;
        this.sourceList.push(name);
    };
}
