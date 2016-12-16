/// <reference types="numeral" />
export declare class NumeralService {
    numeral: Numeral;
    constructor(language: NumeralJSLanguage);
    setLanguage(language: NumeralJSLanguage): void;
    number(n: any): Numeral;
    float(n: any): string;
    int(n: any): string;
    percentage(n: any): string;
}
