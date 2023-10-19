/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { HomePageProjectsSectionConfigurationPage } from './HomePageProjectsSectionConfigurationPage'
import { $fragmentRefs, intlMock, formMock, $refType } from '~/mocks'

const props = {
  paginatedProjectsFragmentRef: $fragmentRefs,
  allProjectsFragmentRef: $fragmentRefs,
  homePageProjectsSectionConfigurationFragmentRef: $fragmentRefs,
  displayMode: 'MOST_RECENT',
  homePageProjectsSectionConfiguration: {
    id: 'SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=',
    title: 'titre',
    position: 3,
    teaser: 'sous titre',
    displayMode: 'MOST_RECENT',
    enabled: true,
    nbObjects: 4,
    projects: {
      edges: [],
    },
    ' $refType': $refType,
  },
  currentLanguage: 'fr-FR',
  maxProjectsDisplay: 9,
  intl: intlMock,
  ...formMock,
}
describe('<HomePageProjectsSectionConfigurationPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<HomePageProjectsSectionConfigurationPage {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
