/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { TagThemes } from './TagThemes'
import { $refType } from '~/mocks'

const theme = {
  basic: [
    {
      ' $refType': $refType,
      title: 'Justice',
    },
    {
      ' $refType': $refType,
      title: 'Éducation',
    },
  ],
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<TagThemes />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TagThemes themes={theme.basic} size="15px" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with other size', () => {
    const wrapper = shallow(<TagThemes themes={theme.basic} size="12px" />)
    expect(wrapper).toMatchSnapshot()
  })
})
