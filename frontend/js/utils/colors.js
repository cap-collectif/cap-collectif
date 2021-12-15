// @flow
import { TYPE_ALERT } from '~/constants/AlertConstants';

export const colors = {
  black: '#000000',
  dark: '#212529',
  defaultCustomColor: '#007c91',
  primaryColor: '#0388cc',
  dangerColor: '#dc3545',
  warningColor: '#f0ad4e',
  successColor: '#088A20',
  infoColor: '#1D8293',
  darkGray: '#707070',
  gray: '#737373',
  secondGray: '#8E8E8E',
  thirdGray: '#424242',
  lightGray: '#ddd',
  iconGrayColor: '#acacac',
  borderColor: '#e3e3e3',
  pageBgc: '#f6f6f6',
  white: '#ffffff',
  darkText: '#333333',
  error: '#f00041',
  lightBlue: '#007bff',
  lightGreen: '#28a745',
  orange: '#f09200',
  duckBlue: '#17a2b8',
  metaBlue: '#5bc0de',
  yellow: '#ffc107',
  blue: '#3b88fd',
  darkerGray: '#85919D',
  accessibleColors: [
    '#36c',
    '#dc3912',
    '#f90',
    '#109618',
    '#909',
    '#0099c6',
    '#d47',
    '#6a0',
    '#b82e2e',
    '#316395',
    '#949',
    '#2a9',
    '#aa1',
    '#63c',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
  ],
  votes: ['#5cb85c', '#f0ad4e', '#d9534f'],
  formBgc: '#fafafa',
  paleGrey: '#ecf0f5',
  secondaryGray: '#6c757d',
  disabledGray: '#eee',
  grayF4: '#f4f4f4',
  red: '#fd4d4f',
  tradewind: '#54BAA6',
  fireBush: '#E29829',
  silverChalice: '#afafaf',
};

// WIP but usefull. Waiting for the full table with real names
export const styleGuideColors = {
  red: '#e02020',
  darkBlue: '#001b38',
  gray: '#6b7885',
  gray500: '#85919D',
  gray300: '#6B7885',
  gray600: '#6B7885',
  gray700: '#545E68',
  gray900: '#272B30',
  darkGray: '#374850',
  blue: '#3b88fd',
  blue100: '#fafcff',
  blue150: '#e0efff',
  blue200: '#c2dfff',
  blue500: '#1a88ff',
  blue800: '#003670',
  white: '#ffffff',
  green150: '#E4F9E9',
  orange150: '#FFF3E0',
  yellow700: '#a87e00',
  green500: '#46d267',
  red100: '#FEFBFB',
  red200: '#F6CBCF',
  red500: '#dd3c4c',

};

export const socialColors = {
  facebook: '#3b5998',
  twitter: '#00aced',
  linkedin: '#0077b5',
  email: '#212529',
  link: '#212529',
};

export const CardHeaderColors = {
  gray: colors.borderColor,
  white: colors.white,
  green: '#d4edda',
  bluedark: '#87c1ff',
  blue: '#cce5ff',
  orange: '#fff3cd',
  red: '#f8d7da',
  default: colors.pageBgc,
};

export const BsStyleColors = {
  INFO: colors.infoColor,
  PRIMARY: colors.defaultCustomColor,
  SUCCESS: colors.successColor,
  WARNING: colors.warningColor,
  DANGER: colors.dangerColor,
  DEFAULT: colors.darkGray,
};

export const AlertColors = {
  [TYPE_ALERT.SUCCESS]: {
    background: '#d4edda',
    color: '#155724',
  },
  [TYPE_ALERT.ERROR]: {
    background: '#f8d7db',
    color: '#491218',
  },
};

export const boxShadow = `1px 2px 2px 1px ${colors.lightGray}`;

export default colors;
