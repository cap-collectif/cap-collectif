// @flow
import * as React from 'react';
import * as Icons from './index';

export const ICON_NAME: {
  calendar: 'calendar',
  networkAdd: 'network-add',
  share: 'share',
  link: 'link',
  mail: 'mail',
  google: 'google',
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  franceConnect: 'franceConnect',
  radioButton: 'radioButton',
  radioButtonChecked: 'radioButton--checked',
  plus: 'plus',
  close: 'close',
  error: 'error',
  trash: 'trash',
  arrowDown: 'arrowDown',
  menu: 'menu',
  information: 'information',
  arrowThickCircleDown: 'arrow-thick-circle-down',
  openId: 'openId',
  saml: 'saml',
  chevronLeft: 'chevron-left',
} = {
  calendar: 'calendar',
  networkAdd: 'network-add',
  share: 'share',
  link: 'link',
  mail: 'mail',
  google: 'google',
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  franceConnect: 'franceConnect',
  radioButton: 'radioButton',
  radioButtonChecked: 'radioButton--checked',
  plus: 'plus',
  close: 'close',
  error: 'error',
  trash: 'trash',
  arrowDown: 'arrowDown',
  menu: 'menu',
  information: 'information',
  arrowThickCircleDown: 'arrow-thick-circle-down',
  openId: 'openId',
  saml: 'saml',
  chevronLeft: 'chevron-left',
};

type Props = {
  name: $Values<typeof ICON_NAME>,
  title?: string,
  color?: string,
  size?: number,
  ariaHidden?: boolean,
};

const getIcon = name => {
  switch (name) {
    case 'calendar':
      return <Icons.Calendar />;
    case 'network-add':
      return <Icons.NetworkAdd />;
    case 'share':
      return <Icons.Share />;
    case 'link':
      return <Icons.IconLink />;
    case 'mail':
      return <Icons.Mail />;
    case 'google':
      return <Icons.Google />;
    case 'facebook':
      return <Icons.Facebook />;
    case 'twitter':
      return <Icons.Twitter />;
    case 'linkedin':
      return <Icons.Linkedin />;
    case 'franceConnect':
      return <Icons.FranceConnect />;
    case 'radioButton':
      return <Icons.RadioButton />;
    case 'radioButton--checked':
      return <Icons.RadioButtonChecked />;
    case 'plus':
      return <Icons.Plus />;
    case 'close':
      return <Icons.Close />;
    case 'error':
      return <Icons.Error />;
    case 'trash':
      return <Icons.Trash />;
    case 'arrowDown':
      return <Icons.ArrowDown />;
    case 'menu':
      return <Icons.Menu />;
    case 'information':
      return <Icons.Information />;
    case 'arrow-thick-circle-down':
      return <Icons.ArrowThickCircleDown />;
    case 'openId':
    case 'saml':
      return <Icons.OpenId />;
    case 'chevron-left':
      return <Icons.ChevronLeft />;

    default:
      return <div />;
  }
};

const Icon = ({ name, title, color, size, ariaHidden = true, ...rest }: Props) =>
  React.cloneElement(getIcon(name), {
    title,
    fill: color,
    width: size,
    height: size,
    'aria-hidden': ariaHidden,
    style: {
      verticalAlign: 'middle',
    },
    ...rest,
  });

export default Icon;
