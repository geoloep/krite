declare namespace wgx {
    export function install(window: Document): void;
}

declare module 'wicked-good-xpath' {
    export = wgx;
}