// @flow
/*
Format from 0645678976
To 06 45 67 89 76
*/
function splitPhoneNumber(phoneNumberString: ?string) {
  if (phoneNumberString) {
    const cleaned = `${phoneNumberString}`.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      return ` ${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
  }
  return phoneNumberString;
}
export default splitPhoneNumber;
