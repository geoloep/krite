export class ServiceManager {
    private dependencies: { [index: string]: any } = {};
    private promised: { [index: string]: any[] } = {};

    addService<T>(name: string, service: T) {
        this.dependencies[name] = service;

        if (name in this.promised) {
            this.resolvePromises(name);
        }

        return service;
    }

    getService<T>(name: string): T {
        if (!(name in this.dependencies)) {
            throw new Error(`${name} was requested but not available`);
        }

        return this.dependencies[name];
    }

    tryService<T>(name: string): T | undefined {
        if (name in this.dependencies) {
            return this.dependencies[name];
        }
    }

    promiseService<T>(name: string): Promise<T> {
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

    hasService(name: string) {
        return (name in this.dependencies);
    }

    private resolvePromises(name: string) {
        console.assert(name in this.promised);

        for (let resolve of this.promised[name]) {
            resolve(this.getService(name));
        }

        delete this.promised[name];
    }
}
