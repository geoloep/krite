declare namespace url {
    export function format(options: any): string;
}

declare module 'url' {
    export = url;
}