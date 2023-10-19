/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormCategoryIcon } from './ProposalFormCategoryIcon'

describe('<ProposalFormCategoryIcon />', () => {
  const props = {
    onIconClick: jest.fn(),
    id: 'iddddddddd',
    selectedColor: 'blue',
    selectedIcon: 'parking',
    categoryIcons: [
      {
        name: 'parking',
        used: true,
      },
      {
        name: 'leaf',
        used: false,
      },
      {
        name: 'omarlebg.svg',
        used: true,
      },
    ],
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormCategoryIcon {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
