/*
Copyright 2017 Geoloep

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

import * as wgx from 'wicked-good-xpath';

let IE = false;

if (!document.evaluate) {
    // This must mean we're running inside IE(11)

    // Polyfill xpath support, by installing on the document prototype all following documents and XMLdocuments
    // should have the evaluate method available
    //
    // WGX seems to only work on a very restricted set of xpath functionality
    wgx.install({ document: Document.prototype });

    IE = true;
}

/**
 * This service wraps some common xml parse and search functions
 */
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

    constructor(text: string | Node) {
        let document: Document;
        if (typeof (text) === 'string') {
            document = this.document = this.parser.parseFromString(text, 'application/xml');
        } else {
            document = this.document = text.ownerDocument;
        }

        this.prefixedNameSpaces = document.createNSResolver(document.ownerDocument == null ? document.documentElement : document.ownerDocument.documentElement);
        this.unprefixedNameSpace = <string> document.documentElement.getAttribute('xmlns');
    }

    /**
     * True if document.evaluate was not available, probably running inside Internet Explorer
     */
    get IE() {
        return IE;
    }

    /**
     * Return a snapshot of nodes conforming to the xpath expression
     * @param context
     * @param xpath
     */
    node(context: Node, xpath: string) {
        return this.document.evaluate(xpath, context, this.namespaceResolver, 7, null);
    }

    /**
     * Returns the string value of the node selected with the xpath expression
     * @param context
     * @param xpath
     */
    string(context: Node, xpath: string) {
        return this.document.evaluate(xpath, context, this.namespaceResolver, 2, null).stringValue;
    }

    /**
     * Returns the numeric value of the node selected with the xpath expression
     * @param context
     * @param xpath
     */
    number(context: Node, xpath: string) {
        return this.document.evaluate(xpath, context, this.namespaceResolver, 1, null).numberValue;
    }
}
