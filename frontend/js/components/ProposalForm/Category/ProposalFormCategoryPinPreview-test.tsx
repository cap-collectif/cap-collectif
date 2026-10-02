/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormCategoryPinPreview } from './ProposalFormCategoryPinPreview'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalFormCategoryPinPreview />', () => {
  const props = {
    color: 'blue',
    icon: 'parking',
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormCategoryPinPreview {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
