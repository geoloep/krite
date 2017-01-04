export class PdokLocatieserverService {
    search(searchString: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fetch(`http://geodata.nationaalgeoregister.nl/locatieserver/suggest?q=${searchString}`).then((response) => {
                if (response.ok) {
                    response.json().then((json) => {
                        resolve(this.parseResponse(json));
                    }).catch((reason) => {
                        reject(reason);
                    });
                } else {
                    reject();
                }
            }).catch((reason) => {
                reject(reason);
            });
        });
    }

    inspect(id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fetch(`http://geodata.nationaalgeoregister.nl/locatieserver/lookup?id=${id}`).then((response) => {
                if (response.ok) {
                    response.json().then(resolve).catch(reject);
                } else {
                    reject();
                }
            }).catch((reason) => {
                reject(reason);
            });
        });
    }

    parseResponse(response: any) {
        let parsed: any = {}

        for (let doc of response.response.docs) {
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