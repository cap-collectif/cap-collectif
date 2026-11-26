// ***********************************************************
// This example support/index.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import './mailcatcher'
import { prepareTestFeatureFlags } from './setupFeatureFlags'

const installGooglePlacesMock = (win: Window) => {
  const location = {
    lat: () => 48.8566,
    lng: () => 2.3522,
  }
  const result = {
    address_components: [],
    formatted_address: '25 rue claude tillier',
    geometry: { location },
    place_id: 'cypress-place-id',
    types: [],
  }

  ;(win as any).google = {
    maps: {
      Geocoder: class {
        geocode(_request, callback) {
          callback([result], 'OK')
        }
      },
      GeocoderStatus: {
        OK: 'OK',
      },
      places: {
        AutocompleteService: class {
          getPlacePredictions(_request, callback) {
            callback(
              [
                {
                  description: '25 rue claude tillier',
                  place_id: 'cypress-place-id',
                  structured_formatting: { main_text: '25 rue claude tillier', secondary_text: '' },
                },
              ],
              'OK',
            )
          }
        },
        PlacesServiceStatus: {
          OK: 'OK',
          ZERO_RESULTS: 'ZERO_RESULTS',
        },
      },
    },
  }
}

Cypress.on('uncaught:exception', err => {
  const resizeObserverErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ]
  const ignoredErrors = [
    ...resizeObserverErrors,
    '[react-places-autocomplete]: Google Maps JavaScript API library must be loaded.',
  ]

  if (ignoredErrors.some(substring => err.message.includes(substring))) {
    return false
  }
})

beforeEach(function () {
  cy.on('window:before:load', installGooglePlacesMock)
  cy.appendOperationToGraphQLFetch()
  if (!this.currentTest) throw new Error('Feature flags require a running Cypress test.')
  prepareTestFeatureFlags(this.currentTest)
})

afterEach(() => {
  cy.task('reset:feature-flags', {})
})
