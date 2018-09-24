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

/**
 * This file contains a tiny node-url shim with only the query paramater formatting functionality
 */

export interface IUrlOptions {
    query: { [index: string]: string };
}

export default {
    /**
     * Format the query parameters of an url
     * @param options Object containing key value parameter pairs
     */
    format(options: IUrlOptions) {
        let url = '?';

        for (const parameterName in options.query) {
            if (options.query[parameterName]) {
                url += (url.length > 1 ? '&' : '') + parameterName + '=' + options.query[parameterName];
            }
        }

        return url;
    },
};
