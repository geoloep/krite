/// <reference types="numeral" />
export declare class NumeralService {
    numeral: Numeral;
    constructor(locale: string);
    setLocale(locale: string): void;
    number(n: any): Numeral;
    float(n: any): string;
    int(n: any): string;
    percentage(n: any): string;
}
