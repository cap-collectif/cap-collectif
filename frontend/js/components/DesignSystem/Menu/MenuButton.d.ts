import { MenuButtonHTMLProps } from 'reakit/Menu'
import { FC } from 'react';

type Props = MenuButtonHTMLProps & {
  as?: any
}

declare const MenuButton: FC<Props>

export default MenuButton;
