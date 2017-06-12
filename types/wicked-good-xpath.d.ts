declare namespace wgx {
    export function install(window: {
        document: Document
    }): void;
}

declare module 'wicked-good-xpath' {
    export = wgx;
}