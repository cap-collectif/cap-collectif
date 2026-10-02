/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { LanguageButtonWrapper } from './LanguageButtonWrapper'
import { $refType, $fragmentRefs } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<LanguageButtonWrapper />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
    languages: [
      {
        ' $refType': $refType,
        ' $fragmentRefs': $fragmentRefs,
      },
    ],
  }
  it('should render correctly', () => {
    const wrapper = shallow(<LanguageButtonWrapper {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
