// @flow
import { TYPE_ALERT } from '~/constants/AlertConstants';

const colors = {
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
  yellow: '#ffc107',
  blue: '#3b88fd',
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
  info: colors.infoColor,
  primary: colors.defaultCustomColor,
  success: colors.successColor,
  warning: colors.warningColor,
  danger: colors.dangerColor,
  default: colors.darkGray,
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
