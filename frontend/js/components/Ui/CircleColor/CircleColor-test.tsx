/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import CircleColor from './CircleColor'

describe('<CircleColor />', () => {
  it('renders correctly', () => {
    const props = {
      editable: true,
      onChange: jest.fn(),
      colors: [
        {
          label: 'global.primary',
          name: 'PRIMARY',
          hexValue: '#3b88fd',
        },
        {
          label: 'global.green',
          name: 'SUCCESS',
          hexValue: '#399a39',
        },
        {
          label: 'global.orange',
          name: 'WARNING',
          hexValue: '#f4b721',
        },
      ],
      defaultColor: {
        label: 'global.orange',
        name: 'WARNING',
        hexValue: '#f4b721',
      },
    }
    const wrapper = shallow(<CircleColor {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
