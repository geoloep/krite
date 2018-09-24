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

import url from '../util/url';
/**
 * This class facilitates communication with the Nominatim by OSM
 */
export class NominatimService {
    /**
     * Peform a request to the nomatim search service
     * @param searchString string to search for
     * @param options additional optional url parameters
     */
    async search(searchString: string, options?: any) {
        const parameters = {
            q: searchString,
            format: 'json',
        };

        if (options) {
            Object.assign(parameters, options);
        }

        const response = await fetch(' http://nominatim.openstreetmap.org/search' + url.format({
            query: parameters,
        }), {
            headers: {
                'User-Agent': 'krite/1.0 (https://github.com/geoloep/krite)',
            },
        });

        if (!response.ok) {
            throw new Error('Response from nomatim search not ok');
        }

        return await response.json();
    }
}
