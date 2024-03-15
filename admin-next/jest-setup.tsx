/* eslint-env jest */
/* eslint-disable no-console */

import 'whatwg-fetch'

// @ts-ignore
global.console = {
  log: console.log,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

jest.mock('@cap-collectif/ui', () => {
  const mockMath = Object.create(global.Math)
  mockMath.random = () => 0.5
  global.Math = mockMath
  return {
    // @ts-ignore
    ...jest.requireActual('@cap-collectif/ui'),
  }
})

jest.mock('./utils/NoSSR.tsx', () => {
  return props => props.children
})

export const appContextValue = {
  viewerSession: {
    email: 'come-back@gmail.com',
    username: 'Theo',
    id: 'user-123',
    isAdmin: true,
    isSuperAdmin: false,
    isProjectAdmin: false,
  },
  appVersion: 'app-v1',
}
