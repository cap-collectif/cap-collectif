/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import RankingList from './RankingList'

const baseRankingList = {
  id: '123-rakintlist',
  dataForm: {
    id: '12',
    helpText: "Texte d'aide",
    required: false,
    choices: [
      {
        id: '24',
        label: 'Maxime Arrouard',
      },
      {
        id: '25',
        label: 'Spylou Super Sayen',
      },
      {
        id: '26',
        label: 'Cyril Lage',
      },
      {
        id: '27',
        label: 'Jpec Superman',
      },
    ],
    values: null,
  },
  isDisabled: false,
  onChange: jest.fn(),
}
const rankingList = {
  basic: { ...baseRankingList },
  isDisabled: { ...baseRankingList, isDisabled: true },
}
describe('<RankingList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<RankingList {...rankingList.basic} hasIllustrationDisplayed />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(<RankingList {...rankingList.isDisabled} />)
    expect(wrapper).toMatchSnapshot()
  })
})
