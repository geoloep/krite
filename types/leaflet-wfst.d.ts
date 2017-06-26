declare namespace L {
    interface WFSOptions {
        crs?: L.CRS;
        showExisting?: boolean;
        geometryField?: string;
        url?: string;
        typeNS?: string;
        typeName?: string;
        style?: any;
        filter?: any;
    }

    interface WFSConstructor {
        new (options: L.WFSOptions): L.Layer;
    }

    interface FilterConstructor {
        new (): FilterConstructor;
        append(layer: L.Layer, property: string, crs: L.CRS): FilterConstructor;
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