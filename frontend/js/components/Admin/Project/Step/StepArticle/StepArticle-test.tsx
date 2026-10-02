/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { StepArticle } from './StepArticle'

const baseProps = {
  dispatch: jest.fn(),
  articles: [
    {
      id: '123',
      url: 'https://blabla.com',
    },
    {
      id: '456',
      url: 'https://blabla.com',
    },
  ],
}
const props = {
  basic: baseProps,
  noArticles: { ...baseProps, articles: [] },
}
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<StepArticle />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<StepArticle {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when no articles', () => {
    const wrapper = shallow(<StepArticle {...props.noArticles} />)
    expect(wrapper).toMatchSnapshot()
  })
})
