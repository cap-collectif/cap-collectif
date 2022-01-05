export const Headers = [
    'title',
    'firstname',
    'lastname',
    'address1',
    'address2',
    'address3',
    'zipCode',
    'city',
    'country',
];

export const frenchSeparator = ';';
export const commaSeparator = ',';
export const FrenchHeadersLine = Headers.join(frenchSeparator);
export const CommaHeadersLine = Headers.join(commaSeparator);

export type DatumType = {
    title: string;
    firstname: string;
    lastname: string;
    address1: string;
    address2: string;
    address3: string;
    zipCode: string;
    city: string;
    country: string;
};

export type DataType = {
    validData: Array<DatumType>;
    invalidLines: Array<number>;
    duplicateLines: Array<number>;
};
