/* eslint-env jest */
// @ts-nocheck
/* eslint-disable no-console */
import 'babel-polyfill'
import 'whatwg-fetch'
import $ from 'jquery'
import moment from 'moment-timezone'
import 'moment/locale/fr'
import { configure } from 'enzyme'
import Adapter from '@cfaester/enzyme-adapter-react-18'
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import util from 'util'
import { QueryRenderer } from 'react-relay'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { createStore } from 'redux'
import { initialState as initialDefaultState } from './frontend/js/redux/modules/default'
configure({
  adapter: new Adapter(),
})
moment.locale('fr')
moment.tz.setDefault('Europe/Paris')
// @ts-expect-error
global.$ = require('jquery')(window)
// @ts-expect-error
global.$ = $
// @ts-expect-error
global.jQuery = $
global.Cookies = {
  getJSON: () => '',
  set: () => '', // @ts-expect-error
  get: () => {},
}
global.Modernizr = {
  intl: true,
} // @ts-expect-error
global.window.__SERVER__ = false
;(global.TextEncoder = util.TextEncoder),
  // This mock works only with a normal function (source: https://stackoverflow.com/a/67575349)
  // eslint-disable-next-line func-names
  // @ts-expect-error
  (global.window.IntersectionObserver = function () {
    return {
      observe: jest.fn(),
      disconnect: jest.fn(),
    }
  })

global.window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,

      addListener() {},

      removeListener() {},
    }
  }

console.error = () => {}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    // deprecated
    removeListener: jest.fn(),
    // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

/**
 * This is a global function to test Relay components.
 * You can provide the GraphQL query with a great mock API.
 * It supports passing a redux state.
 *
 * It's highly opinionated because it does a full render and not shallow-rendering.
 *
 * See: https://facebook.github.io/relay/docs/en/testing-relay-components.html#fragment-container-tests
 */
export const renderWithRelay = (
  ui,
  {
    initialState = {
      default: initialDefaultState,
      user: {
        user: null,
      },
      intl: {
        locale: 'fr-FR',
        messages: {},
      },
    },
    store = createStore(() => initialState, initialState), // @ts-expect-error
    query,
    props = {}, // @ts-expect-error
    spec,
    environment = createMockEnvironment(),
  } = {},
) => {
  const TestRenderer = () => (
    // @ts-expect-error
    <Provider store={store}>
      {/** @ts-expect-error */}
      <IntlProvider>
        {/** @ts-expect-error */}
        <QueryRenderer
          environment={environment}
          query={query}
          variables={{}}
          render={({ error, props: relayProps }) => {
            if (relayProps) {
              return React.createElement(ui, { ...props, ...relayProps }, null)
            }

            if (error) {
              return <div>{error.message}</div>
            }

            return <div>'Loading...'</div>
          }}
        />
      </IntlProvider>
    </Provider>
  )

  // @ts-expect-error
  const renderer = ReactTestRenderer.create(<TestRenderer />)
  // $FlowFixMe we need an MockEnvironnment type
  environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation, spec))
  return renderer
}

global.renderWithRelay = renderWithRelay
jest.doMock('react-intl', () => {
  const intl = {
    locale: 'fr-FR',
    formats: {},
    messages: {},
    now: () => 0,
    formatHTMLMessage: message => String(message),
    formatPlural: message => String(message),
    formatNumber: message => String(message),
    formatRelative: message => String(message),
    formatTime: message => String(message),
    formatDate: message => String(message),
    formatMessage: message => String(message.id),
  }
  const RealIntl = jest.requireActual('react-intl')
  return {
    IntlProvider: RealIntl.IntlProvider,
    FormattedMessage: RealIntl.FormattedMessage,
    FormattedDate: RealIntl.FormattedDate,
    FormattedHTMLMessage: RealIntl.FormattedHTMLMessage,
    FormattedTime: RealIntl.FormattedTime,
    FormattedNumber: RealIntl.FormattedNumber,
    injectIntl: RealIntl.injectIntl,
    useIntl: () => intl,
  }
})
// By default all feature flags are disabled in tests.
global.mockFeatureFlag = jest.fn(() => false)
jest.doMock('./admin-next/shared/hooks/useFeatureFlag', () => {
  return global.mockFeatureFlag
})
jest.doMock('use-analytics', () => {
  return {
    useAnalytics: () => ({
      track: jest.fn(),
    }),
  }
})

jest.doMock('@uppy/core', () => {
  return props => (props.children ? <Mock {...props} testID="Uppy" /> : null)
})
jest.doMock('@uppy/status-bar', () => {
  return props => (props.children ? <Mock {...props} testID="StatusBar" /> : null)
})
jest.doMock('@uppy/file-input', () => {
  return props => (props.children ? <Mock {...props} testID="FileInput" /> : null)
})
jest.doMock('@uppy/tus', () => {
  return props => (props.children ? <Mock {...props} testID="Tus" /> : null)
})
jest.doMock('@uppy/locales/lib/fr_FR', () => {
  return {}
})

jest.doMock('react-on-rails', () => {
  const ReactOnRails = {
    getStore: () => {},
  }
  return ReactOnRails
})
jest.doMock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({
    slug: 'slug',
  }),
  useLocation: () => ({
    state: {},
  }),
  useRouteMatch: () => ({
    url: '/mock/url',
  }),
}))

const Mock = ({ children, testID, ...props }) => (
  <div data-testid={testID} {...props}>
    {children}
  </div>
)

jest.doMock('reakit/Popover', () => {
  const Popover = props => (props.children ? <Mock {...props} testID="Popover" /> : null)

  return {
    ...jest.requireActual('reakit/Popover'),
    Popover,
  }
})

jest.doMock('@cap-collectif/ui', () => {
  const mockMath = Object.create(global.Math)
  const Modal = props => <Mock {...props} testID="Modal" />
  const MultiStepModal = props => <Mock {...props} testID="MultiStepModal" />
  const Menu = props => <Mock {...props} testID="Menu" />
  const Popover = props => <Mock {...props} testID="Popover" />
  const Tooltip = props => <Mock {...props} testID="Tooltip" />

  Menu.Item = props => <Mock {...props} testID="Item" />
  Menu.List = props => <Mock {...props} testID="List" />
  Menu.OptionGroup = props => <Mock {...props} testID="OptionGroup" />
  Menu.OptionItem = props => <Mock {...props} testID="OptionItem" />

  Modal.Header = props => <Mock {...props} testID="Header" />
  Modal.Body = props => <Mock {...props} testID="Body" />
  Modal.Footer = props => <Mock {...props} testID="Footer" />

  MultiStepModal.Header = Modal.Header
  MultiStepModal.Body = Modal.Body
  MultiStepModal.Footer = Modal.Footer

  Popover.Header = Modal.Header
  Popover.Body = Modal.Body

  mockMath.random = () => 0.5

  global.Math = mockMath
  return {
    ...jest.requireActual('@cap-collectif/ui'),
    Modal,
    MultiStepModal,
    Menu,
    Popover,
    Tooltip,
  }
})

jest.doMock('reakit/Menu', () => {
  const Menu = props => (props.children ? <Mock {...props} testID="Menu" /> : null)
  const MenuButton = props => (props.children ? <Mock {...props} testID="MenuButton" /> : null)
  const MenuItem = props => (props.children ? <Mock {...props} testID="MenuItem" /> : null)

  return {
    ...jest.requireActual('reakit/Menu'),
    Menu,
    MenuButton,
    MenuItem,
  }
})

jest.doMock('react-leaflet', () => {
  const MapContainer = props => <div data-testid="map">{props.children}</div>
  const Popup = props => <div data-testid="map-popup">{props.children}</div>

  return {
    useMapEvents: jest.fn(),
    MapContainer,
    Popup,
    Control: jest.fn(),
  }
})
jest.doMock('leaflet-gesture-handling', () => {
  return {
    GestureHandling: jest.fn(),
  }
})
jest.doMock('@react-leaflet/core', () => {
  return {
    useLeafletContext: jest.fn(),
    createControlComponent: component => component,
  }
})
jest.doMock('react-leaflet-markercluster', () => {
  return props => <div data-testid="react-leaflet-markercluster">{props.children}</div>
})
jest.doMock('leaflet.locatecontrol/dist/L.Control.Locate.min', () => {
  return ''
})
jest.doMock('jodit-react', () => {
  return props => <div data-testid="jodit-react">{props.children}</div>
})
jest.doMock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  const { forwardRef } = jest.requireActual('react')

  const custom = Component => {
    return forwardRef((props, ref) => {
      const regularProps = Object.fromEntries(
        // do not pass framer props to DOM element
        Object.entries(props).filter(([key]) => !actual.isValidMotionProp(key)),
      )
      return typeof Component === 'string' ? (
        <div ref={ref} {...regularProps} />
      ) : (
        <Component ref={ref} {...regularProps} />
      )
    })
  }

  const componentCache = new Map()
  const motion = new Proxy(custom, {
    get: (_target, key) => {
      if (!componentCache.has(key)) {
        componentCache.set(key, custom(key))
      }

      return componentCache.get(key) !== null
    },
  })
  return {
    ...actual,
    AnimatePresence: ({ children }) => (children ? <div data-testid="AnimatePresence">{children}</div> : null),
    motion,
  }
})
