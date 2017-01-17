declare namespace L {
    export interface Map {
        options: {
            crs: L.CRS
        }
    }

    export interface CRS {
        projection: L.Projection
    }

    export interface Projection {
        proj4def?: string
    }
}