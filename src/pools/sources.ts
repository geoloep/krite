/*
Copyright 2018 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Krite } from '../krite';
import { IDataSource } from '../types';

export class SourcePool {
    list: string[] = [];

    private sources: { [index: string]: any } = {};
    private promised: { [index: string]: any[] } = {};

    constructor(private krite: Krite) {}

    /**
     * Add multiple services in one go
     * @param services A dictionary of services
     */
    addSources = (sources: { [index: string]: IDataSource }) => {
        for (const source in sources) {
            if (sources.hasOwnProperty(source)) {
                this.add<any>(source, sources[source]);
            }
        }
    };

    /**
     * Add a single data source
     * @param name Source name
     * @param source Source instance
     */
    add = <T extends IDataSource>(name: string, source: T): T => {
        this.sources[name] = source;
        this.list.push(name);

        if (source.added) {
            source.added(this.krite);
        }

        if (name in this.promised) {
            this.resolvePromises(name);
        }

        return source;
    };

    /**
     * Get a data source or die
     * @param name Source name
     */
    get = <T extends IDataSource>(name: string): T => {
        if (!(name in this.sources)) {
            throw new Error(`${name} was requested but is not available`);
        }

        return this.sources[name];
    };

    /**
     * Try to get a data source
     * @param name Source name
     * @returns Undefined when source is not available
     */
    try = <T>(name: string): T | undefined => {
        if (name in this.sources) {
            return this.sources[name];
        } else {
            return;
        }
    };

    /**
     * Return a promise that resolves as soon as the data source becomes available
     * @param name Source name
     */
    promise = <T>(name: string): Promise<T> => {
        return new Promise<T>((resolve) => {
            if (name in this.sources) {
                resolve(this.sources[name]);
            } else {
                if (!(name in this.promised)) {
                    this.promised[name] = [];
                }
                this.promised[name].push(resolve);
            }
        });
    };

    /**
     * Test if a source is available
     * @param name Source name
     */
    has = (name: string) => {
        return name in this.sources;
    };

    private resolvePromises(name: string) {
        console.assert(name in this.promised);

        for (const resolve of this.promised[name]) {
            resolve(this.get(name));
        }

        delete this.promised[name];
    }
}
