import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';

type Props = {
  readonly title?: string,
  readonly type: 'checkbox' | 'radio',
  readonly value?: string | string[],
  readonly onChange?: (newValue: string | string[]) => void,
}

declare const MenuOptionGroup: PolymorphicComponent<Props>

export default MenuOptionGroup;
