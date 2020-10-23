// @flow
import * as React from 'react';
import cn from 'classnames';
import * as Icons from './index';

export const ICON_NAME = {
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
  googleColored: 'googleColored',
  facebook: 'facebook',
  facebookF: 'facebookF',
  twitter: 'twitter',
  linkedin: 'linkedin',
  addCircle: 'addCircle',
  smallCaps: 'smallCaps',
  textStyle: 'textStyle',
  franceConnect: 'franceConnect',
  franceConnectIcon: 'franceConnectIcon',
  radioButton: 'radioButton',
  radioButtonChecked: 'radioButton--checked',
  plus: 'plus',
  close: 'close',
  error: 'error',
  trash: 'trash',
  download: 'download',
  trash2: 'trash2',
  arrowDown: 'arrowDown',
  menu: 'menu',
  information: 'information',
  arrowThickCircleDown: 'arrow-thick-circle-down',
  openId: 'openId',
  saml: 'saml',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',
  checkbox: 'checkbox',
  checkboxChecked: 'checkboxChecked',
  file: 'file',
  check: 'check',
  message: 'message',
  askBubble: 'askBubble',
  messageBubble: 'messageBubble',
  messageBubbleCheck: 'messageBubbleCheck',
  messageBubbleFilled: 'messageBubbleFilled',
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
  warningRounded: 'warningRounded',
  reload: 'reload',
  pin: 'pin',
  tag: 'tag',
  accounting: 'accounting',
  love: 'love',
  hashtag: 'hashtag',
  fileText: 'fileText',
  conversation: 'conversation',
  sort: 'sort',
  like: 'like',
  navigationLeft: 'navigationLeft',
  flag: 'flag',
  lock: 'lock',
  bell: 'bell',
  stamp: 'stamp',
  newspaper: 'newspaper',
  pin2: 'pin2',
  folder: 'folder',
  micro: 'micro',
  eventOnline: 'eventOnline',
  eventPhysical: 'eventPhysical',
  camera: 'camera',
  step: 'step',
  user: 'user',
  play: 'play',
  userLive: 'userLive',
  join: 'join',
  vip: 'vip',
  verified: 'verified',
  singleMan: 'singleMan',
  singleManFilled: 'singleManFilled',
  paperPlane: 'paperPlane',
  locationNotAuthorize: 'location-not-authorize',
  search: 'search',
  newUser: 'new-user',
  locationTarget: 'locationTarget',
  less: 'less',
  filter: 'filter',
  grandLyonConnect: 'grandLyonConnect',
  pdfIcon: 'pdfIcon',
  zipIcon: 'zipIcon',
  vidIcon: 'vidIcon',
  docIcon: 'docIcon',
  fileIcon: 'fileIcon',
  fileIcon2: 'fileIcon2',
  bookmark: 'bookmark',
  budget: 'budget',
  vote: 'vote',
  urne: 'urne',
  wifiOff: 'wifiOff',
  removeCircle: 'removeCircle',
  arrowRight: 'arrowRight',
  bubbleO: 'bubble-o',
  calendarO: 'calendar-o',
  clockO: 'clock-o',
  debateO: 'debate-o',
  reporteO: 'reporte-o',
  sendO: 'send-o',
  writeO: 'write-o',
  padO: 'pad-o',
  micO: 'mic-o',
  thumbO: 'thumb-o',
  certified: 'certified',
  sendMail: 'send-mail',
  trophy: 'trophy',
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
  opacity?: number,
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
    case 'googleColored':
      return <Icons.GoogleColored />;
    case 'facebook':
      return <Icons.Facebook />;
    case 'facebookF':
      return <Icons.FacebookF />;
    case 'twitter':
      return <Icons.Twitter />;
    case 'linkedin':
      return <Icons.Linkedin />;
    case 'textStyle':
      return <Icons.TextStyle />;
    case 'smallCaps':
      return <Icons.SmallCaps />;
    case 'addCircle':
      return <Icons.AddCircle />;
    case 'askBubble':
      return <Icons.AskBubble />;
    case 'franceConnect':
      return <Icons.FranceConnect />;
    case 'franceConnectIcon':
      return <Icons.FranceConnectIcon />;
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
    case 'chevron-right':
      return <Icons.ChevronRight />;
    case 'chevron-up':
      return <Icons.ChevronUp />;
    case 'chevron-down':
      return <Icons.ChevronDown />;
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
    case 'download':
      return <Icons.DownLoad />;
    case 'messageBubble':
      return <Icons.MessageBubble />;
    case 'messageBubbleFilled':
      return <Icons.MessageBubbleFilled />;
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
    case 'reload':
      return <Icons.Reload />;
    case 'pin':
      return <Icons.Pin />;
    case 'tag':
      return <Icons.Tag />;
    case 'accounting':
      return <Icons.Accounting />;
    case 'love':
      return <Icons.Love />;
    case 'hashtag':
      return <Icons.Hashtag />;
    case 'fileText':
      return <Icons.FileText />;
    case 'conversation':
      return <Icons.Conversation />;
    case 'sort':
      return <Icons.Sort />;
    case 'like':
      return <Icons.Like />;
    case 'navigationLeft':
      return <Icons.NavigationLeft />;
    case 'flag':
      return <Icons.Flag />;
    case 'lock':
      return <Icons.Lock />;
    case 'bell':
      return <Icons.Bell />;
    case 'stamp':
      return <Icons.Stamp />;
    case 'newspaper':
      return <Icons.Newspaper />;
    case 'pin2':
      return <Icons.Pin2 />;
    case 'folder':
      return <Icons.Folder />;
    case 'micro':
      return <Icons.Micro />;
    case 'eventOnline':
      return <Icons.EventOnline />;
    case 'eventPhysical':
      return <Icons.EventPhysical />;
    case 'camera':
      return <Icons.Camera />;
    case 'step':
      return <Icons.Step />;
    case 'user':
      return <Icons.User />;
    case 'play':
      return <Icons.Play />;
    case 'userLive':
      return <Icons.UserLive />;
    case 'join':
      return <Icons.Join />;
    case 'vip':
      return <Icons.Vip />;
    case 'verified':
      return <Icons.Verified />;
    case 'singleMan':
      return <Icons.SingleMan />;
    case 'singleManFilled':
      return <Icons.SingleManFilled />;
    case 'paperPlane':
      return <Icons.PaperPlane />;
    case 'location-not-authorize':
      return <Icons.LocationNotAuthorize />;
    case 'search':
      return <Icons.Search />;
    case 'new-user':
      return <Icons.NewUser />;
    case 'locationTarget':
      return <Icons.LocationTarget />;
    case 'less':
      return <Icons.Less />;
    case 'filter':
      return <Icons.Filter />;
    case 'grandLyonConnect':
      return <Icons.GrandLyonConnect />;
    case 'pdfIcon':
      return <Icons.PdfIcon />;
    case 'vidIcon':
      return <Icons.VidIcon />;
    case 'zipIcon':
      return <Icons.ZipIcon />;
    case 'docIcon':
      return <Icons.DocIcon />;
    case 'fileIcon':
      return <Icons.FileIcon />;
    case 'fileIcon2':
      return <Icons.FileIcon2 />;
    case 'bookmark':
      return <Icons.Bookmark />;
    case 'budget':
      return <Icons.Budget />;
    case 'vote':
      return <Icons.Vote />;
    case 'urne':
      return <Icons.Urne />;
    case 'removeCircle':
      return <Icons.RemoveCircle />;
    case 'wifiOff':
      return <Icons.WifiOff />;
    case 'arrowRight':
      return <Icons.ArrowRight />;
    case 'bubble-o':
      return <Icons.BubbleO />;
    case 'calendar-o':
      return <Icons.CalendarO />;
    case 'clock-o':
      return <Icons.ClockO />;
    case 'debate-o':
      return <Icons.DebateO />;
    case 'reporte-o':
      return <Icons.ReporteO />;
    case 'send-o':
      return <Icons.SendO />;
    case 'write-o':
      return <Icons.WriteO />;
    case 'pad-o':
      return <Icons.PadO />;
    case 'mic-o':
      return <Icons.MicO />;
    case 'thumb-o':
      return <Icons.ThumbO />;
    case 'certified':
      return <Icons.Certified />;
    case 'send-mail':
      return <Icons.SendMail />;
    case 'trophy':
      return <Icons.Trophy />;
    default:
      return <div />;
  }
};

const Icon = ({
  name,
  title,
  color,
  size,
  ariaHidden = true,
  classNames,
  opacity,
  ...rest
}: Props) =>
  React.cloneElement(getIcon(name), {
    title,
    fill: color,
    width: size,
    height: size,
    opacity,
    className: cn('icon', classNames),
    'aria-hidden': ariaHidden,
    style: {
      verticalAlign: 'middle',
      flexShrink: '0',
    },
    ...rest,
  });

export default Icon;
