import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';
import Th from '../Th';
import Td from '../Td';

type Props = {
    readonly rowId?: string,
    readonly selectable?: boolean,
    readonly inHead?: boolean,
    readonly children: Th[] | Td[],
    readonly checkboxLabel?: string,
    readonly verticalAlign?: 'top' | 'middle' | 'bottom',
}

declare const Tr: PolymorphicComponent<Props>;

export default Tr;
