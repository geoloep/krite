export class XMLService {
    parser = new DOMParser();
    document: Document;

    prefixedNameSpaces: XPathNSResolver;
    unprefixedNameSpace: string;

    namespaceResolver = {
        lookupNamespaceURI: (prefix: string): string => {
            return this.prefixedNameSpaces.lookupNamespaceURI(prefix) || this.unprefixedNameSpace;
        },
    };

    constructor(text: string) {
        let document = this.document = this.parser.parseFromString(text, 'application/xml');

        this.prefixedNameSpaces = document.createNSResolver(document.ownerDocument == null ? document.documentElement : document.ownerDocument.documentElement);
        this.unprefixedNameSpace = <string>document.documentElement.getAttribute('xmlns');
    }

    node(context: Node, xpath: string) {
        return this.document.evaluate(xpath, context, this.namespaceResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    }

    string(context: Node, xpath: string) {
        return this.document.evaluate(xpath, context, this.namespaceResolver, XPathResult.STRING_TYPE, null).stringValue;
    }
}
