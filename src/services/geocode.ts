import * as $ from 'jquery';
import * as geocodeParser from  '../../../openls-geocode-parser'; // @todo: pakket van maken

export class GeocodeService {
    constructor(readonly baseurl: string) {
    }

    search(searchString: string): Promise<any> {
        return new Promise<any>(
            (resolve, reject) => {
                $.get(this.baseurl, {
                    zoekterm: searchString
                },
                $.noop,
                'text'
                ).done(function(data) {

                    geocodeParser(
                        data,
                        function(resp: any) {
                            resolve(resp);
                        },
                        function() {
                            reject('Parse Error');
                        }
                    );

                }).fail(function() {
                    reject('Ajax Error');
                });
            }
        );
    }

}
