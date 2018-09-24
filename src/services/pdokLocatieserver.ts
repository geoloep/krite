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
 * This class facilitates communication with the Dutch Geocode PDOK Locatieserver service
 */
export class PdokLocatieserverService {
    /**
     * Peform a request to the suggest service
     * @param searchString string to search for
     * @param options additional optional url parameters
     */
    async search(searchString: string, options?: any) {
        const parameters = {
            q: searchString,
            fq: '*',
        };

        if (options) {
            Object.assign(parameters, options);
        }

        const response = await fetch('https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest' + url.format({
            query: parameters,
        }));

        if (!response.ok) {
            throw new Error('Response from locatieserver not ok');
        }

        return this.parseResponse(await response.json());
    }

    /**
     * Perform a request to the lookup service
     * @param id the id of the object to inspect
     * @param options additional optional url parameters
     */
    async inspect(id: string, options?: any) {
        const parameters = {
            id,
        };

        if (options) {
            Object.assign(parameters, options);
        }

        const response = await fetch('https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup' + url.format({
            query: parameters,
        }));

        if (!response.ok) {
            throw new Error('Response from locatieserver not ok');
        }

        return await response.json();
    }

    parseResponse(response: any) {
        const parsed: any = {};

        for (const doc of response.response.docs) {
            if (!(doc.type in parsed)) {
                parsed[doc.type] = [];
            }

            if (doc.id in response.highlighting && response.highlighting[doc.id].suggest.length > 0) {
                doc.suggest = response.highlighting[doc.id].suggest[0];
            } else {
                doc.suggest = doc.weergavenaam;
            }

            parsed[doc.type].push(doc);
        }

        return parsed;
    }
}
