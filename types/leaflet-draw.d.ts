declare namespace L {
    namespace Draw {
        export interface Feature {
            enable(): void;
            disable(): void;
        }

        export interface RectangleConstructor {
            new (map: L.Map, drawoptions: L.DrawOptions.RectangleOptions): L.Draw.Feature;
        }

        export interface PolylineConstructor {
            new (map: L.Map, drawoptions: L.DrawOptions.PolylineOptions): L.Draw.Feature;
        }

        export interface PolygonConstructor {
            new (map: L.Map, drawoptions: L.DrawOptions.PolygonOptions): L.Draw.Feature;
        }

        export var Rectangle: RectangleConstructor;
        export var Polyline: PolylineConstructor
        export var Polygon: PolygonConstructor
    }
}