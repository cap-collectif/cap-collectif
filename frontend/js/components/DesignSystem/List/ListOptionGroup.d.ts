import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import ListOptionGroupItem from './ListOptionGroupItem';

export type ListOptionGroupProps = {
  readonly type: 'checkbox' | 'radio',
  readonly value?: string | string[],
  readonly onChange?: (newValue: string | string[]) => void,
}

declare const ListOptionGroup: PolymorphicComponent<ListOptionGroupProps> & {
    Item: typeof ListOptionGroupItem
}

export default ListOptionGroup;
