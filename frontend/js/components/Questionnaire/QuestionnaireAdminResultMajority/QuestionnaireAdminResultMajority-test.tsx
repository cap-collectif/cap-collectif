/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { QuestionnaireAdminResultMajority } from './QuestionnaireAdminResultMajority'
import { $refType } from '~/mocks'

const baseProps = {
  majorityQuestion: {
    ' $refType': $refType,
    totalVotesCount: 30,
    responsesByChoice: [
      {
        choice: 'VERY_WELL',
        count: 5,
      },
      {
        choice: 'WELL',
        count: 5,
      },
      {
        choice: 'WELL_ENOUGH',
        count: 5,
      },
      {
        choice: 'PASSABLE',
        count: 5,
      },
      {
        choice: 'NOT_PASSABLE',
        count: 5,
      },
      {
        choice: 'REJECTED',
        count: 5,
      },
    ],
  },
}
const props = {
  basic: baseProps,
  noVote: {
    ...baseProps,
    majorityQuestion: { ...baseProps.majorityQuestion, totalVotesCount: 0, responsesByChoice: [] },
  },
}
describe('<QuestionnaireAdminResultMajority />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultMajority {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when 0 vote', () => {
    const wrapper = shallow(<QuestionnaireAdminResultMajority {...props.noVote} />)
    expect(wrapper).toMatchSnapshot()
  })
})
