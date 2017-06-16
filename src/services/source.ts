import { IDataSource } from '../types';

export class SourceService {
    private sources: { [index: string]: any } = {};
    private promised: { [index: string]: any[] } = {};

    add<T extends IDataSource>(name: string, source: T): T {
        this.sources[name] = source;

        if (name in this.promised) {
            this.resolvePromises(name);
        }

        return source;
    };

    get<T extends IDataSource>(name: string): T {
        console.assert(name in this.sources);

        return this.sources[name];
    }

    try<T>(name: string): T | undefined {
        if (name in this.sources) {
            return this.sources[name];
        }
    }

    promise<T>(name: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (name in this.sources) {
                resolve(this.sources[name]);
            } else {
                if (!(name in this.promised)) {
                    this.promised[name] = [];
                }
                this.promised[name].push(resolve);
            }
        });
    }

    has(name: string) {
        return (name in this.sources);
    }

    private resolvePromises(name: string) {
        console.assert(name in this.promised);

        for (let resolve of this.promised[name]) {
            resolve(this.get(name));
        }

        delete this.promised[name];
    }
}
