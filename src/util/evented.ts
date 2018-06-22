/*
Copyright 2018 Geoloep

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { EventEmitter, ListenerFn } from 'eventemitter3';

/**
 * Extend form this class to equip your class with events
 */
export default class Evented {
    private events = new EventEmitter();

    /**
     * Add listener to a given event
     * @param event event name
     * @param fn Listener function
     */
    on = (event: string | symbol, fn: ListenerFn, context?: any) => {
        return this.events.on(event, fn, context);
    }

    /**
     * Add one time listener to a given event
     * @param event event name
     * @param fn Listener function
     */
    once = (event: string | symbol, fn: ListenerFn, context?: any) => {
        return this.events.once(event, fn, context);
    }

    /**
     * Calls each of the listeners registered for a given event.
     * @param event event name
     */
    emit = (event: string | symbol, ...args: any[]): boolean => {
        return this.events.emit(event, ...args);
    }

    /**
     * Remove the listeners of a given event.
     * @param event event name
     */
    off = (event: string | symbol, fn?: ListenerFn, context?: any, once?: boolean) => {
        return this.events.removeListener(event, fn, context);
    }

    /**
     * Remove all listeners, or those of the specified event.
     * @param event event name
     */
    clear = (event?: string) => {
        return this.events.removeAllListeners(event);
    }
}
