import { PdokLocatieserverService } from '../../src/services';
import { createTable } from './utils';

export const pdokLocatieExample = () => {
    const locatieServer = new PdokLocatieserverService();

    const container = document.getElementById('krite-container');
    const logContainer = document.getElementById('log-container');
    if (!container || !logContainer) {
        console.log(container);
        return;
    }

    const input = document.createElement('input');
    const button = document.createElement('button');

    const [tableElement, tableBody] = createTable([
        'id',
        'type',
        'weergavenaam',
        'suggest',
    ]);

    button.innerText = 'Zoeken';

    container.append(input);
    container.append(button);
    container.append(tableElement);

    button.onclick = async () => {
        const suggestions = await locatieServer.search(input.value);

        tableBody.replaceChildren();

        for (const items of Object.values(suggestions)) {
            for (const item of items) {
                const tableRow = document.createElement('tr');
                const idData = document.createElement('td');
                const typeData = document.createElement('td');
                const weergaveData = document.createElement('td');
                const suggestData = document.createElement('td');

                const a = document.createElement('a');

                a.href = '#' + item.id;
                a.innerText = item.id;
                a.onclick = () => {
                    inspect(item.id);
                };

                idData.append(a);
                typeData.innerText = item.type;
                weergaveData.innerText = item.weergavenaam;
                suggestData.innerHTML = item.suggest;

                tableRow.append(idData, typeData, weergaveData, suggestData);
                tableBody.append(tableRow);
            }
        }
    };

    const inspect = async (id: string) => {
        const data = await locatieServer.inspect(id);

        logContainer.replaceChildren();

        if (data.response.docs.length) {
            for (const [key, value] of Object.entries(data.response.docs[0])) {
                const el = document.createElement('p');

                el.innerText = `${key}: ${value}`;

                logContainer.append(el);
            }
        }
    };
};
