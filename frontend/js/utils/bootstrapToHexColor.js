// @flow
export const bootstrapToHex = (key: string) => {
  switch (key) {
    case 'warning':
      return '#f0ad4e';
    case 'info':
      return '#5bc0de';
    case 'success':
      return '#5cb85c';
    case 'danger':
      return '#d9534f';
    default:
      console.warn('unknown bootstrap color: ', key); // eslint-disable-line no-console
      return '#000';
  }
};
