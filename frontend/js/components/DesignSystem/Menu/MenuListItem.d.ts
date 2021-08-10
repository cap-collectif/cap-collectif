import { FC, ReactNode, ComponentProps } from 'react';

export type Props = ComponentProps<'button'> & {
  readonly disabled?: boolean
  readonly children: ReactNode
  readonly closeOnSelect?: boolean
}

declare const MenuListItem: FC<Props>

export default MenuListItem;
