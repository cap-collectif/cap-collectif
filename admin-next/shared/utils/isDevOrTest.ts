export const isDev = url => url === 'https://capco.dev'

export const isTest = url => url === 'https://capco.test'

export const isDevOrTest = url => isDev(url) || isTest(url)

export default isDevOrTest
