import { FC, ReactChild } from 'react';
import Thead from './Thead';
import Tbody from './Tbody';
import Tr from './Tr';
import Th from './Th';
import Td from './Td';
import { AppBoxProps } from '../../Ui/Primitives/AppBox';

export type TableProps = AppBoxProps & {
    readonly actionBar?: ReactChild,
    readonly selectable?: boolean,
    readonly isLoading?: boolean,
};

declare const Table: FC<TableProps> & {
    Thead: typeof Thead;
    Tbody: typeof Tbody;
    Tr: typeof Tr;
    Th: typeof Th;
    Td: typeof Td;
};

export default Table;
