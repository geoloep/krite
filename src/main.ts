// import 'whatwg-fetch';

// Expose Leaflet
import * as L from 'leaflet';
(window as any).L = L;

import pool from './servicePool';

import * as apps from './apps/index';
import * as services from './services/index';
import * as sources from './sources/index';

export let Services = services;
export let Sources = sources;
export let Apps = apps;
export let ServicePool: services.ServiceManager = pool;
