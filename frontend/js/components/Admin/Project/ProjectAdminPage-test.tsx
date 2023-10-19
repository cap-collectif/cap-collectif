/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectAdminPage } from './ProjectAdminPage'
import MockProviders from '~/testUtils'

describe('<ProjectAdminPage />', () => {
  const defaultProps = {
    projectId: 'oui',
    firstCollectStepId: '123456',
  }
  it('renders correctly when editing project', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          user: {
            user: {
              isAdmin: true,
            },
          },
        }}
      >
        <ProjectAdminPage {...defaultProps} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when editing project as project admin', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          user: {
            user: {
              isAdmin: false,
            },
          },
        }}
      >
        <ProjectAdminPage {...defaultProps} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when no project', () => {
    const wrapper = shallow(
      <MockProviders
        store={{
          user: {
            user: {
              isAdmin: true,
            },
          },
        }}
      >
        <ProjectAdminPage projectId={null} firstCollectStepId={null} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
