import { CRS } from 'leaflet';

declare module 'leaflet' {
    interface WFSOptions {
        crs?: CRS;
        showExisting?: boolean;
        geometryField?: string;
        url?: string;
        typeNS?: string;
        typeName?: string;
        style?: any;
        filter?: any;
    }

    interface WFSConstructor {
        new (options: WFSOptions): Layer;
    }

    interface FilterConstructor {
        new (): FilterConstructor;
        append(layer: Layer, property: string, crs: CRS): FilterConstructor;
    }

    interface EQFilterConstructor {
        new (): EQFilterConstructor;
        append(property: string, value: string): EQFilterConstructor;
    }

    var WFS: WFSConstructor;

    namespace Filter {
        var Intersects: FilterConstructor;
        var EQ: EQFilterConstructor;
    }
}

declare module 'leaflet-wfst' {
    export { };
}