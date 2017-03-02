// import 'whatwg-fetch';

// Expose Leaflet
import * as L from 'leaflet';
(window as any).L = L;

import * as services from './services/index';
import * as sources from './sources/index';
import * as apps from './apps/index';
import pool from './servicePool';

export let Services = services;
export let Sources = sources;
export let Apps = apps;
export let ServicePool = pool;
