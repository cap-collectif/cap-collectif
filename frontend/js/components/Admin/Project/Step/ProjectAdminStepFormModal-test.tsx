/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectAdminStepFormModal } from './ProjectAdminStepFormModal'
import { $fragmentRefs, $refType } from '~/mocks'
import MockProviders from '~/testUtils'

describe('<ProjectAdminStepFormModal />', () => {
  const defaultProps = {
    onClose: jest.fn(),
    show: true,
    form: 'ProjectAdminStepForm',
    step: null,
    type: 'OtherStep',
    project: {
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
    hasIdentificationCodeLists: true,
    query: {
      ' $refType': $refType,
      ssoConfigurations: {
        edges: [
          {
            node: {
              __typename: 'FranceConnectSSOConfiguration',
              isCompletelyConfigured: false,
              allowedData: ['family_name'],
              enabled: true,
            },
          },
        ],
      },
    },
  }
  it('renders correctly', () => {
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
        <ProjectAdminStepFormModal {...defaultProps} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly hided', () => {
    const props = { ...defaultProps, show: false }
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
        <ProjectAdminStepFormModal {...props} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with step', () => {
    const props = {
      ...defaultProps,
      step: {
        title: 'test',
      },
    }
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
        <ProjectAdminStepFormModal {...props} />
      </MockProviders>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
