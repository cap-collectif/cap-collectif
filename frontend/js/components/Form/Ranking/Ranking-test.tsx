/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Ranking from './Ranking'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Ranking />', () => {
  const field = {
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
        label: 'Superman',
      },
    ],
    values: null,
  }
  const props = {
    id: 'ranking',
    label: 'label',
    labelClassName: 'label-class',
    getGroupStyle: jest.fn(),
    renderFormErrors: jest.fn(),
    onChange: jest.fn(),
  }
  it('should render correctly', () => {
    const wrapper = shallow(<Ranking {...props} field={field} />)
    expect(wrapper).toMatchSnapshot()
  })
})
