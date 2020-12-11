import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { Props as ListItemProps } from './MenuListItem'

type Props = ListItemProps & {
  readonly value: string
}

declare const MenuOptionItem: PolymorphicComponent<Props>

export default MenuOptionItem;
