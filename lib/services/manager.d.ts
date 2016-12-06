export declare class ServiceManager {
    private dependencies;
    private promised;
    addService<T>(name: string, service: T): T;
    getService<T>(name: string): T;
    tryService<T>(name: string): T | undefined;
    promiseService<T>(name: string): Promise<T>;
    hasService(name: string): boolean;
    private resolvePromises(name);
}
