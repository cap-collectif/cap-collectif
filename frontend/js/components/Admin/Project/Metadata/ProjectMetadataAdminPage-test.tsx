/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectMetadataAdminPage } from './ProjectMetadataAdminPage'
import { formMock, intlMock } from '~/mocks'

const defaultProps = { ...formMock, intl: intlMock, project: null, formName: 'form' }
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectMetadataAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectMetadataAdminPage {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
