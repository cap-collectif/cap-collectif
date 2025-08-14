/*
Format from +33645678976
To 0645678976
*/
const countryCodes = ['+33']

const formatPhoneNumber = (number: string | null | undefined) => {
  if (number) {
    // We look for a country code match
    const countryCodeMatch = countryCodes.some(countryCode => number.includes(countryCode))

    if (!countryCodeMatch) {
      console.error('No Country code match was found')
      return number
    }

    return `0${number.replace(countryCodes[0], '')}`
  }

  return null
}

export default formatPhoneNumber
