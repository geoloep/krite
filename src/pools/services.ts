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
import { IService } from '../types';

export class ServicePool {
    private dependencies: { [index: string]: any } = {};
    private promised: { [index: string]: any[] } = {};

    constructor(private krite: Krite) {
    }

    /**
     * Add multiple services in one go
     * @param services A dictionary of services
     */
    addServices = (services: { [index: string]: IService}) => {
        for (const service in services) {
            if (services.hasOwnProperty(service)) {
                this.add<IService>(service, services[service]);
            }
        }
    }

    /**
     * Add an single service
     * @param name Dependency name
     * @param service Service instance
     */
    add = <T extends IService>(name: string, service: T) => {
        this.dependencies[name] = service;

        if (service.added) {
            service.added(this.krite);
        }

        if (name in this.promised) {
            this.resolvePromises(name);
        }

        return service;
    }

    /**
     * Get a service or die
     * @param name Service name
     */
    get = <T>(name: string): T => {
        if (!(name in this.dependencies)) {
            throw new Error(`${name} was requested but not available`);
        }

        return this.dependencies[name];
    }

    /**
     * Try to get a service
     * @param name Service name
     * @returns Undefined when not in pool
     */
    try = <T>(name: string): T | undefined => {
        if (name in this.dependencies) {
            return this.dependencies[name];
        }
    }

    /**
     * Return a promise that resolves as soon as the service becomes available
     * @param name Service name
     */
    promise = <T>(name: string): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            if (name in this.dependencies) {
                resolve(this.dependencies[name]);
            } else {
                if (!(name in this.promised)) {
                    this.promised[name] = [];
                }
                this.promised[name].push(resolve);
            }
        });
    }

    /**
     * Test if a service is available
     * @param name Service name
     */
    has = (name: string) => {
        return (name in this.dependencies);
    }

    private resolvePromises(name: string) {
        console.assert(name in this.promised);

        for (const resolve of this.promised[name]) {
            resolve(this.get(name));
        }

        delete this.promised[name];
    }
}
