// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import cn from 'classnames';
import Label from '~/components/Ui/Form/Label/Label';
import { type PropsCommonCheckboxRadio } from '../commonCheckboxRadio';
import MajorityContainer from './Majority.style';

export type MajorityProperty = {|
  color: string,
  id: string,
  label: string,
  value: string,
|};

export const COLORS = {
  VERY_WELL: {
    color: '#33691e',
    id: 'very-well',
    label: 'very-well',
    value: '0',
  },
  WELL: {
    color: '#43a047',
    id: 'global-well',
    label: 'global-well',
    value: '1',
  },
  WELL_ENOUGH: {
    color: '#ffc107',
    id: 'global-well-enough',
    label: 'global-well-enough',
    value: '2',
  },
  PASSABLE: {
    color: '#ff9800',
    id: 'global-passable',
    label: 'global-passable',
    value: '3',
  },
  NOT_PASSABLE: {
    color: '#b71c1c',
    id: 'global-not-passable',
    label: 'global-not-passable',
    value: '4',
  },
  REJECTED: {
    color: '#212121',
    id: 'global-reject',
    label: 'global-reject',
    value: '5',
  },
};

type Props = {|
  ...PropsCommonCheckboxRadio,
  label: string,
  color: string,
  hasMajoritySelected?: boolean,
  disableColors?: boolean,
  asPreview?: boolean,
|};

const Majority = ({
  label,
  className,
  id,
  name,
  value,
  onChange,
  onBlur,
  disableColors = false,
  disabled = false,
  checked = false,
  hasMajoritySelected = false,
  asPreview = false,
  color,
  typeForm,
}: Props) => (
  <MajorityContainer
    className={cn(className, { 'majority-checked': checked, 'majority-disabled': disabled })}
    checked={checked}
    color={color}
    disabled={disabled}
    disableColors={disableColors}
    hasMajoritySelected={hasMajoritySelected}
    asPreview={asPreview}>
    <Label htmlFor={id} id={`label-${id}`} typeForm={typeForm}>
      <FormattedMessage id={label} />
    </Label>
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      id={id}
      value={value}
      disabled={disabled}
    />
  </MajorityContainer>
);

export default Majority;
