/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { GlobalDistrictForm } from './GlobalDistrictForm'
import { formMock, $fragmentRefs, $refType } from '~/mocks'
import { features } from '~/redux/modules/default'

const defaultDistrict = {
  ' $fragmentRefs': $fragmentRefs,
  ' $refType': $refType,
  id: '1',
  name: 'oui',
  geojson: 'oui',
  displayedOnMap: true,
  border: null,
  background: null,
  translations: [
    {
      locale: 'fr-FR',
      name: 'Français',
    },
  ],
}
const defaultProps = {
  ...formMock,
  show: true,
  isCreating: true,
  member: 'oui',
  defaultLanguage: 'fr-FR',
  handleClose: jest.fn(),
  district: defaultDistrict,
  features,
}
describe('<GlobalDistrictForm />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<GlobalDistrictForm {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
