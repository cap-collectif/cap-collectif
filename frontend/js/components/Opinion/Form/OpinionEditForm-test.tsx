/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { OpinionEditForm } from './OpinionEditForm'
import { $refType } from '../../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<OpinionEditForm />', () => {
  const props = {
    handleSubmit: jest.fn(),
    opinion: {
      id: 'opinion1',
      ' $refType': $refType,
      step: {
        consultations: {
          edges: [
            {
              node: {
                descriptionHelpText: 'descriptionHelpText',
                titleHelpText: 'titleHelpText',
              },
            },
          ],
        },
      },
      appendices: [
        {
          body: 'content',
          appendixType: {
            title: 'Exposé des motifs',
          },
        },
      ],
      title: 'titre',
      body: 'body',
    },
    initialValues: {},
  }
  it('renders a form', () => {
    const wrapper = shallow(<OpinionEditForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
