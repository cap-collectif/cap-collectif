/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EventListFilters } from './EventListFilters'
import { intlMock, formMock, $refType, $fragmentRefs } from '../../../mocks'
import { features } from '../../../redux/modules/default'
import MockProviders from '~/testUtils'

const defaultProps = {
  query: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  },
  userTypes: [
    {
      id: 'userType-1',
      name: 'Citoyen',
    },
    {
      id: 'userType-2',
      name: 'Institution',
    },
  ],
  addToggleViewButton: true,
  ...formMock,
  intl: intlMock,
  search: 'PHP',
  theme: 'theme-1',
  orderBy: {
    field: 'START_AT',
    direction: 'ASC',
  },
  userType: null,
  project: 'UHJvamVjdDpwcm9qZWN0MQ==',
  author: null,
  isRegistrable: 'all',
  features: { ...features, themes: true, projects_form: true, display_map: true },
}
describe('<EventListFilters />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <MockProviders>
        <EventListFilters {...defaultProps} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly without filters', () => {
    const props = {
      ...defaultProps,
      addToggleViewButton: false,
      features: { ...features, themes: false, projects_form: false, display_map: false },
    }
    const wrapper = shallow(
      <MockProviders>
        <EventListFilters {...props} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
