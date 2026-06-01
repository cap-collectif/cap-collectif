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

  it('should keep stable droppable ids', () => {
    const wrapper = shallow(<RankingList {...rankingList.basic} />)

    expect(wrapper.find('List').at(0).prop('id')).toEqual('ranking__choices')
    expect(wrapper.find('List').at(1).prop('id')).toEqual('ranking__selection')
  })

  it('should keep compact ranking order when moving an item after another one through an empty slot', () => {
    const onChange = jest.fn()
    const wrapper = shallow(
      <RankingList
        {...rankingList.basic}
        onChange={onChange}
        dataForm={{
          ...rankingList.basic.dataForm,
          choices: [rankingList.basic.dataForm.choices[2], rankingList.basic.dataForm.choices[3]],
          values: [rankingList.basic.dataForm.choices[0], rankingList.basic.dataForm.choices[1]],
        }}
      />,
    )

    wrapper.find('Context').prop('onDragEnd')({
      draggableId: '24',
      source: {
        droppableId: 'ranking__selection',
        index: 0,
      },
      destination: null,
      combine: {
        draggableId: 'ranking__selection-3',
        droppableId: 'ranking__selection',
        index: 3,
      },
      reason: 'DROP',
    })

    expect(onChange).toHaveBeenCalledWith([
      rankingList.basic.dataForm.choices[1],
      rankingList.basic.dataForm.choices[0],
    ])
  })
})
