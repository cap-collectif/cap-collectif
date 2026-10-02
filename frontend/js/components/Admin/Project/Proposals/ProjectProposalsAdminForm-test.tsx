/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectProposalsAdminForm } from './ProjectProposalsAdminForm'
import { formMock, intlMock, $refType } from '../../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProjectProposalsAdminForm />', () => {
  const defaultProps = { ...formMock, intl: intlMock, project: null, dispatch: jest.fn() }
  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectProposalsAdminForm {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        ' $refType': $refType,
        id: '1',
        opinionCanBeFollowed: true,
      },
    }
    const wrapper = shallow(<ProjectProposalsAdminForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
