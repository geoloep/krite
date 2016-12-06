declare namespace searchparams {
    export function parse(params: string): any;
    export function build(obj: any): string;
    export function toObject(params: any): any;
    export function omit(params: string, omit: string[]): string;
}

declare module 'search-params' {
    export = searchparams
}