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

const baseUrl = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

export type LocatieServerObjectType =
    | 'provincie'
    | 'gemeente'
    | 'woonplaats'
    | 'weg'
    | 'postcode'
    | 'adres'
    | 'perceel'
    | 'hectometerpaal'
    | 'wijk'
    | 'buurt'
    | 'waterschapsgrens'
    | 'appartementsrecht';

export interface LocatieServerSuggestOptionalParameters {
    /**
     * Sort search results based upon distance from this point
     */
    lat: number;
    lon: number;

    /**
     * Fields to return
     */
    fl: string;

    /**
     * Filter query
     */
    fq: string;

    /**
     * Fields to boost
     */
    qf: string;

    /**
     * Field values to boost
     */
    bq: string;

    /**
     * Start index
     */
    start: number;

    /**
     * Number of rows to return
     */
    rows: number;

    /**
     * Sort order
     */
    sort: string;

    /**
     * Output format
     */
    wt: 'json' | 'xml';
}

export interface LocatieServerInspectOptionalParameters {
    /**
     * Fields to return
     */
    fl: string;

    /**
     * Filter query
     */
    fq: string;

    /**
     * Output format
     */
    wt: 'json' | 'xml';
}

export type LocatieServerSuggestHighlighting = Record<
    string,
    {
        suggest?: string[];
    }
>;

/**
 * Default values, with fl query parameter the contents of .doc will change
 */
export interface SuggestDoc {
    type: LocatieServerObjectType;
    weergavenaam: string;
    id: string;
    score: number;
}

export interface LocatieServerSuggestResponse {
    highlighting: LocatieServerSuggestHighlighting;
    response: {
        maxScore: number;
        numFound: number;
        numFoundExact: boolean;
        start: number;
        docs: SuggestDoc[];
    };
    spellcheck: unknown;
}

export interface LocatieServerInspectResponse {
    response: {
        maxScore: number;
        numFound: number;
        numFoundExact: number;
        start: 0;
        docs: Record<string, string>[];
    };
}

export interface KriteSuggestResponseDoc extends SuggestDoc {
    suggest: string;
}

/**
 * This class facilitates communication with the Dutch Geocode PDOK Locatieserver service
 */
export class PdokLocatieserverService {
    /**
     * Perform a request to the suggest service
     * @param searchString string to search for
     * @param options additional optional url parameters
     */
    async search(
        searchString: string,
        options?: Partial<LocatieServerSuggestOptionalParameters>
    ) {
        const parameters = {
            q: searchString,
        };

        if (options) {
            Object.assign(parameters, options);
        }

        const response = await fetch(
            `${baseUrl}/suggest` +
                url.format({
                    query: parameters,
                })
        );

        if (!response.ok) {
            throw new Error(
                'Response from locatieserver suggest endpoint not ok'
            );
        }

        return this.parseResponse(await response.json());
    }

    /**
     * Perform a request to the lookup service
     * @param id the id of the object to inspect
     * @param options additional optional url parameters
     */
    async inspect(
        id: string,
        options?: Partial<LocatieServerInspectOptionalParameters>
    ): Promise<LocatieServerInspectResponse> {
        const parameters = {
            id,
        };

        if (options) {
            Object.assign(parameters, options);
        }

        const response = await fetch(
            `${baseUrl}/lookup` +
                url.format({
                    query: parameters,
                })
        );

        if (!response.ok) {
            throw new Error(
                'Response from locatieserver lookup endpoint not ok'
            );
        }

        return await response.json();
    }

    parseResponse(response: LocatieServerSuggestResponse) {
        const parsed: Partial<
            Record<LocatieServerObjectType, KriteSuggestResponseDoc[]>
        > = {};

        for (const doc of response.response.docs) {
            if (!(doc.type in parsed)) {
                parsed[doc.type] = [];
            }

            parsed[doc.type]!.push({
                ...doc,
                suggest:
                    response.highlighting[doc.id].suggest?.filter((value) => {
                        return value;
                    })[0] || doc.weergavenaam,
            });
        }

        return parsed;
    }
}
