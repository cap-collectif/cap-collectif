// @flow
import * as React from 'react';
import cn from 'classnames';
import * as Icons from './index';

export const ICON_NAME: {
  chart: 'chart',
  pen: 'pen',
  eye: 'eye',
  clock: 'clock',
  unfavorable: 'unfavorable',
  ongoing: 'ongoing',
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
  trash2: 'trash2',
  arrowDown: 'arrowDown',
  menu: 'menu',
  information: 'information',
  arrowThickCircleDown: 'arrow-thick-circle-down',
  openId: 'openId',
  saml: 'saml',
  chevronLeft: 'chevron-left',
  checkbox: 'checkbox',
  checkboxChecked: 'checkboxChecked',
  file: 'file',
  check: 'check',
  message: 'message',
  messageBubble: 'messageBubble',
  messageBubbleCheck: 'messageBubbleCheck',
  doubleMessageBubble: 'doubleMessageBubble',
  taskList: 'taskList',
  done: 'done',
  todo: 'todo',
  inProgress: 'inProgress',
  silent: 'silent',
  favorable: 'favorable',
  crossRounded: 'cross--rounded',
  warning: 'warning',
  externalLink: 'external-link',
  list: 'list',
  draft: 'draft',
  stack: 'stack',
  tag: 'tag',
  pin: 'pin',
  warningRounded: 'warningRounded',
  reload: 'reload',
} = {
  chart: 'chart',
  pen: 'pen',
  eye: 'eye',
  clock: 'clock',
  unfavorable: 'unfavorable',
  ongoing: 'ongoing',
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
  trash2: 'trash2',
  arrowDown: 'arrowDown',
  menu: 'menu',
  information: 'information',
  arrowThickCircleDown: 'arrow-thick-circle-down',
  openId: 'openId',
  saml: 'saml',
  chevronLeft: 'chevron-left',
  checkbox: 'checkbox',
  checkboxChecked: 'checkboxChecked',
  file: 'file',
  check: 'check',
  message: 'message',
  messageBubble: 'messageBubble',
  messageBubbleCheck: 'messageBubbleCheck',
  doubleMessageBubble: 'doubleMessageBubble',
  taskList: 'taskList',
  done: 'done',
  todo: 'todo',
  inProgress: 'inProgress',
  silent: 'silent',
  favorable: 'favorable',
  crossRounded: 'cross--rounded',
  warning: 'warning',
  externalLink: 'external-link',
  list: 'list',
  draft: 'draft',
  stack: 'stack',
  tag: 'tag',
  pin: 'pin',
  warningRounded: 'warningRounded',
  reload: 'reload',
};

type Props = {|
  name: $Values<typeof ICON_NAME>,
  title?: string,
  classNames?: string,
  color?: string,
  size?: string | number,
  ariaHidden?: boolean,
  height?: string,
  width?: string,
  className?: string,
  viewBox?: string,
  onClick?: () => void,
|};

const getIcon = name => {
  switch (name) {
    case 'chart':
      return <Icons.Chart />;
    case 'pen':
      return <Icons.Pen />;
    case 'eye':
      return <Icons.Eye />;
    case 'ongoing':
      return <Icons.Ongoing />;
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
    case 'cross--rounded':
    case 'unfavorable':
      return <Icons.CrossRounded />;
    case 'error':
      return <Icons.Error />;
    case 'trash':
      return <Icons.Trash />;
    case 'trash2':
      return <Icons.Trash2 />;
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
    case 'checkbox':
      return <Icons.Checkbox />;
    case 'checkboxChecked':
      return <Icons.CheckboxChecked />;
    case 'check':
    case 'favorable':
      return <Icons.Check />;
    case 'file':
      return <Icons.File />;
    case 'message':
      return <Icons.Message />;
    case 'doubleMessageBubble':
      return <Icons.DoubleMessageBubble />;
    case 'messageBubble':
      return <Icons.MessageBubble />;
    case 'taskList':
    case 'todo':
      return <Icons.TaskList />;
    case 'done':
      return <Icons.Done />;
    case 'inProgress':
      return <Icons.InProgress />;
    case 'clock':
      return <Icons.Clock />;
    case 'silent':
      return <Icons.Silent />;
    case 'warning':
      return <Icons.Warning />;
    case 'warningRounded':
      return <Icons.WarningRounded />;
    case 'external-link':
      return <Icons.ExternalLink />;
    case 'list':
      return <Icons.List />;
    case 'draft':
      return <Icons.PenWritePaper />;
    case 'stack':
      return <Icons.Stack />;
    case 'messageBubbleCheck':
      return <Icons.MessageBubbleCheck />;
    case 'tag':
      return <Icons.Tag />;
    case 'pin':
      return <Icons.Pin />;
    case 'reload':
      return <Icons.Reload />;
    default:
      return <div />;
  }
};

const Icon = ({ name, title, color, size, ariaHidden = true, classNames, ...rest }: Props) =>
  React.cloneElement(getIcon(name), {
    title,
    fill: color,
    width: size,
    height: size,
    className: cn('icon', classNames),
    'aria-hidden': ariaHidden,
    style: {
      verticalAlign: 'middle',
      flexShrink: '0',
    },
    ...rest,
  });

export default Icon;
