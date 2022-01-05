import DropzoneFile from 'react-dropzone';
import { DataType, DatumType, frenchSeparator, commaSeparator } from './DataType';

const csvToArray = (content: string): Array<string> => {
    let rows = content.split('\n');

    if (rows.at(-1) === '') {
        rows.pop();
    }
    if (rows.at(0).includes('firstname')) {
        rows.shift();
    }

    return rows;
};

export const isBlank = (content: string): boolean => {
    return /^\s*$/.test(content);
};

const areRequiredCellsFilled = (rowAsArray: Array<string>): boolean => {
    return (
        rowAsArray.length === 9 &&
        rowAsArray[0] !== '' &&
        !isBlank(rowAsArray[0]) &&
        rowAsArray[1] !== '' &&
        !isBlank(rowAsArray[1]) &&
        rowAsArray[2] !== '' &&
        !isBlank(rowAsArray[2]) &&
        rowAsArray[3] !== '' &&
        !isBlank(rowAsArray[3]) &&
        rowAsArray[6] !== '' &&
        !isBlank(rowAsArray[6]) &&
        rowAsArray[7] !== '' &&
        !isBlank(rowAsArray[7]) &&
        rowAsArray[8] !== '' &&
        !isBlank(rowAsArray[8])
    );
};

const stringToDatum = (line: string): DatumType | null => {
    let splitted = line.split(frenchSeparator);
    if (splitted.length < 2) {
        splitted = line.split(commaSeparator);
    }
    if (areRequiredCellsFilled(splitted)) {
        return {
            title: splitted[0],
            firstname: splitted[1],
            lastname: splitted[2],
            address1: splitted[3],
            address2: splitted[4],
            address3: splitted[5],
            zipCode: splitted[6],
            city: splitted[7],
            country: splitted[8],
        };
    }
    return null;
};

const isEqual = (first: DatumType, second: DatumType): boolean => {
    return JSON.stringify(first) === JSON.stringify(second);
};

const isAlreadyThere = (data: DataType, datum: DatumType): boolean => {
    return data.validData.findIndex(elt => isEqual(elt, datum)) >= 0;
};

const analyseRow = (data: DataType, value: string, index: number): void => {
    const datum = stringToDatum(value);
    if (datum) {
        if (isAlreadyThere(data, datum)) {
            data.duplicateLines.push(index + 1);
        } else {
            data.validData.push(datum);
        }
    } else {
        data.invalidLines.push(index + 1);
    }
};

export const extractAndSetData = (file: File, callback: (data: DataType) => void): void => {
    let data: DataType = {
        validData: [],
        invalidLines: [],
        duplicateLines: [],
    };
    const reader = new window.FileReader();
    reader.onload = () => {
        const result = reader.result;
        const lines = csvToArray(result);
        lines.forEach((value: string, index: number) => {
            analyseRow(data, value, index);
        });
        callback(data);
    };
    reader.readAsText(file);
};
