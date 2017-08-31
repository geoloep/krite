import * as url from 'url';

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
