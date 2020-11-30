import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { ReactNode } from 'react';

type Props =  {
  readonly disabled?: boolean
  readonly children: ReactNode
}

declare const MenuListItem: PolymorphicComponent<Props>

export default MenuListItem;
