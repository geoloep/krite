import * as numeral from 'numeral';

export class NumeralService {
    numeral = numeral;

    constructor(language: NumeralJSLanguage) {
        this.setLanguage(language);
    }

    setLanguage(language: NumeralJSLanguage) {
        this.numeral.language('krite', language);
        this.numeral.language('krite');
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