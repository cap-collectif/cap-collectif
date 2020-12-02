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
  messageBubbleQuestion: 'messageBubbleQuestion',
  messageBubbleSearch: 'messageBubbleSearch',
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
  argument: 'argument',
  legalHammer: 'legalHammer',
  pdfIcon: 'pdfIcon',
  zipIcon: 'zipIcon',
  vidIcon: 'vidIcon',
  docIcon: 'docIcon',
  fileIcon: 'fileIcon',
  fileIcon2: 'fileIcon2',
  bookmark: 'bookmark',
  bookmark2: 'bookmark2',
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
  bin: 'bin',
  'gas-station': 'gas-station',
  boat: 'boat',
  earth: 'earth',
  travel: 'travel',
  passport: 'passport',
  economy: 'economy',
  parking: 'parking',
  cocktail: 'cocktail',
  restaurant: 'restaurant',
  'farmer-market': 'farmer-market',
  network: 'network',
  'mobile-phone': 'mobile-phone',
  company: 'company',
  urbanism: 'urbanism',
  village: 'village',
  'construction-cone': 'construction-cone',
  'vegetables-plate': 'vegetables-plate',
  'grocery-shopping': 'grocery-shopping',
  'shopping-bag': 'shopping-bag',
  medical: 'medical',
  hospital: 'hospital',
  health: 'health',
  bicycle: 'bicycle',
  officer: 'officer',
  'surveillance-camera': 'surveillance-camera',
  'family-children': 'family-children',
  'family-walk-park': 'family-walk-park',
  'family-child-play-ball': 'family-child-play-ball',
  'basketball-ball': 'basketball-ball',
  'dog-leash': 'dog-leash',
  water: 'water',
  tree: 'tree',
  'park-bench-light': 'park-bench-light',
  recycle: 'recycle',
  'agriculture-machine-tractor': 'agriculture-machine-tractor',
  hand: 'hand',
  solidarity: 'solidarity',
  hierarchy: 'hierarchy',
  elderly: 'elderly',
  paraplegic: 'paraplegic',
  car: 'car',
  carpooling: 'carpooling',
  'bus-station': 'bus-station',
  'railroad-train': 'railroad-train',
  briefcase: 'briefcase',
  'book-flip-page': 'book-flip-page',
  culture: 'culture',
  'official-building': 'official-building',
  graduate: 'graduate',
  'light-bulb': 'light-bulb',
  energy: 'energy',
  icn: 'icn',
  'ecology-leaf': 'ecology-leaf',
  pin3: 'pin3',
  browser: 'browser',
  letter: 'letter',
  danger: 'danger',
  favoriteBook: 'favoriteBook',
  stampedPaper: 'stampedPaper',
  thinArrowUp: 'thin-arrow-up',
  thinArrowDown: 'thin-arrow-down',
  money: 'money',
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
  style?: { [property: string]: any },
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
    case 'messageBubbleQuestion':
      return <Icons.MessageBubbleQuestion />;
    case 'messageBubbleSearch':
      return <Icons.MessageBubbleSearch />;
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
    case 'bookmark':
      return <Icons.Bookmark />;
    case 'bookmark2':
      return <Icons.Bookmark2 />;
    case 'argument':
      return <Icons.Argument />;
    case 'legalHammer':
      return <Icons.LegalHammer />;
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
    case 'bin':
      return <Icons.Bin />;
    case 'gas-station':
      return <Icons.GasStation />;
    case 'boat':
      return <Icons.Boat />;
    case 'earth':
      return <Icons.Earth />;
    case 'travel':
      return <Icons.Travel />;
    case 'passport':
      return <Icons.Passport />;
    case 'economy':
      return <Icons.Economy />;
    case 'parking':
      return <Icons.Parking />;
    case 'cocktail':
      return <Icons.Cocktail />;
    case 'restaurant':
      return <Icons.Restaurant />;
    case 'farmer-market':
      return <Icons.FarmerMarket />;
    case 'network':
      return <Icons.Network />;
    case 'mobile-phone':
      return <Icons.MobilePhone />;
    case 'company':
      return <Icons.Company />;
    case 'urbanism':
      return <Icons.Urbanism />;
    case 'village':
      return <Icons.Village />;
    case 'construction-cone':
      return <Icons.ConstructionCone />;
    case 'vegetables-plate':
      return <Icons.VegetablesPlate />;
    case 'grocery-shopping':
      return <Icons.GroceryShopping />;
    case 'shopping-bag':
      return <Icons.ShoppingBag />;
    case 'medical':
      return <Icons.Medical />;
    case 'hospital':
      return <Icons.Hospital />;
    case 'health':
      return <Icons.Health />;
    case 'bicycle':
      return <Icons.Bicycle />;
    case 'officer':
      return <Icons.Officer />;
    case 'surveillance-camera':
      return <Icons.SurveillanceCamera />;
    case 'family-children':
      return <Icons.FamilyChildren />;
    case 'family-walk-park':
      return <Icons.FamilyWalkPark />;
    case 'family-child-play-ball':
      return <Icons.FamilyChildPlayBall />;
    case 'basketball-ball':
      return <Icons.BasketballBall />;
    case 'dog-leash':
      return <Icons.DogLeash />;
    case 'water':
      return <Icons.Water />;
    case 'tree':
      return <Icons.Tree />;
    case 'park-bench-light':
      return <Icons.ParkBenchLight />;
    case 'recycle':
      return <Icons.Recycle />;
    case 'agriculture-machine-tractor':
      return <Icons.AgricultureMachineTractor />;
    case 'hand':
      return <Icons.Hand />;
    case 'solidarity':
      return <Icons.Solidarity />;
    case 'hierarchy':
      return <Icons.Hierarchy />;
    case 'elderly':
      return <Icons.Elderly />;
    case 'paraplegic':
      return <Icons.Paraplegic />;
    case 'car':
      return <Icons.Car />;
    case 'carpooling':
      return <Icons.Carpooling />;
    case 'bus-station':
      return <Icons.BusStation />;
    case 'railroad-train':
      return <Icons.RailroadTrain />;
    case 'briefcase':
      return <Icons.Briefcase />;
    case 'book-flip-page':
      return <Icons.BookFlipPage />;
    case 'culture':
      return <Icons.Culture />;
    case 'official-building':
      return <Icons.OfficialBuilding />;
    case 'graduate':
      return <Icons.Graduate />;
    case 'light-bulb':
      return <Icons.LightBulb />;
    case 'energy':
      return <Icons.Energy />;
    case 'icn':
      return <Icons.Icn />;
    case 'ecology-leaf':
      return <Icons.EcologyLeaf />;
    case 'pin3':
      return <Icons.Pin3 />;
    case 'browser':
      return <Icons.Browser />;
    case 'letter':
      return <Icons.Letter />;
    case 'danger':
      return <Icons.Danger />;
    case 'favoriteBook':
      return <Icons.FavoriteBook />;
    case 'stampedPaper':
      return <Icons.StampedPaper />;
    case 'thin-arrow-up':
      return <Icons.ThinArrowUp />;
    case 'thin-arrow-down':
      return <Icons.ThinArrowDown />;
    case 'money':
      return <Icons.Money />;
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
  opacity,
  classNames,
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
