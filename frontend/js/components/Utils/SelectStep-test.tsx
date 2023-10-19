/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SelectStep } from './SelectStep'
import { $refType, intlMock } from '../../mocks'

describe('<SelectStep />', () => {
  const props = {
    query: {
      projects: {
        edges: [
          {
            node: {
              id: 'project1',
              title: 'Save the world',
              steps: [
                {
                  id: 'step1',
                  title: 'Save the world',
                },
                {
                  id: 'step2',
                  title: 'Save the world',
                },
              ],
            },
          },
          {
            node: {
              id: 'project2',
              title: 'Decrease the GES to 55% before 2030',
              steps: [
                {
                  id: 'step1',
                  title: 'Save the world',
                },
              ],
            },
          },
        ],
      },
      ' $refType': $refType,
    },
    intl: intlMock,
    name: 'steps',
    label: 'steps',
    projectIds: ['project2'],
    clearable: true,
    multi: true,
    disabled: false,
    optional: false,
  }
  const noProject = {
    query: {
      projects: {
        edges: [],
      },
      ' $refType': $refType,
    },
    intl: intlMock,
    name: 'steps',
    multi: true,
    label: 'steps',
    projectIds: [],
    clearable: true,
    disabled: false,
    optional: false,
  }
  const emptyList = {
    query: {
      projects: {
        edges: [
          {
            node: {
              id: 'project1',
              title: 'Save the world',
              steps: [],
            },
          },
        ],
      },
      ' $refType': $refType,
    },
    intl: intlMock,
    name: 'steps',
    label: 'steps',
    projectIds: [],
    multi: true,
    clearable: true,
    disabled: false,
    optional: false,
  }
  it('should render correctly', () => {
    const wrapper = shallow(<SelectStep {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render empty list', () => {
    const wrapper = shallow(<SelectStep {...emptyList} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render without project', () => {
    const wrapper = shallow(<SelectStep {...noProject} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render disabled', () => {
    const wrapper = shallow(<SelectStep {...props} disabled />)
    expect(wrapper).toMatchSnapshot()
  })
})
