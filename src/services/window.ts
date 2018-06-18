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

export type IStateChangeCallback = (newState: string) => void;

export class WindowService {
    state: string;
    stateChangeCallbacks: IStateChangeCallback[] = [];

    constructor(public breakpoint = 991) {
        this.setState();

        window.onresize = this.setState;
    }

    onStateChange(func: IStateChangeCallback) {
        this.stateChangeCallbacks.push(func);
        func(this.state);
    }

    private stateChange(newState: string) {
        if (newState !== this.state) {
            this.state = newState;
            this.stateChanged();
        }
    }

    private stateChanged() {
        for (const callback of this.stateChangeCallbacks) {
            callback(this.state);
        }
    }

    private setState = () => {
        if (window.innerWidth > this.breakpoint) {
            this.stateChange('wide');
        } else {
            this.stateChange('narrow');
        }
    }
}
