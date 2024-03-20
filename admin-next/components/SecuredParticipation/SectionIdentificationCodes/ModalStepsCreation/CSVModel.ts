import { FrenchHeadersLine } from '../DataType'

const CSVModelContent = 'data:text/csv;charset=utf-8,' + FrenchHeadersLine + '\r\n'

export const CSVModelURI = encodeURI(CSVModelContent)
export const CSVModelName = 'cap-collectif-import-data-for-identification-codes.csv'
