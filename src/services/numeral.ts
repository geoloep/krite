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
