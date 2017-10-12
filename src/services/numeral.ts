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

import * as numeral from 'numeral';

export class NumeralService {
    numeral = numeral;

    constructor(locale: string) {
        this.setLocale(locale);
    }

    setLocale(locale: string) {
        this.numeral.locale(locale);
    }

    number(n: any) {
        return numeral(n);
    }

    float(n: any) {
        return numeral(parseFloat(n)).format('(0,0.00)');
    }

    int(n: any) {
        return numeral(parseFloat(n)).format('(0,0)');
    }

    percentage(n: any) {
        return numeral(parseFloat(n) / 100).format('0%');
    }
}
