import { PdokLocatieserverService } from '../../src/services';

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

    const suggestContainer = document.createElement('ul');
    suggestContainer.id = 'suggest-list';

    button.innerText = 'Zoeken';

    container.append(input);
    container.append(button);
    container.append(suggestContainer);

    button.onclick = async () => {
        const suggestions = await locatieServer.search(input.value);

        suggestContainer.replaceChildren();

        for (const [cat, items] of Object.entries(suggestions)) {
            for (const item of items) {
                const el = document.createElement('li');

                const a = document.createElement('a');

                a.href = '#' + item.id;
                a.innerText = `${cat}: ${item.weergavenaam}`;
                a.onclick = () => {
                    inspect(item.id);
                };

                el.append(a);
                suggestContainer.append(el);
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
