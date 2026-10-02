/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { $fragmentRefs, $refType } from '../../mocks'
import { ConsultationListView } from './ConsultationListView'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ConsultationListView />', () => {
  it('should render correctly with a list of consultations', () => {
    const props = {
      consultations: {
        ' $refType': $refType,
        edges: [
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
              id: 'firstConsultation',
            },
          },
          {
            node: {
              ' $fragmentRefs': $fragmentRefs,
              id: 'secondConsultation',
            },
          },
        ],
      },
    }
    const wrapper = shallow(<ConsultationListView {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with no consultations', () => {
    const props = {
      consultations: {
        ' $refType': $refType,
        edges: [],
      },
    }
    const wrapper = shallow(<ConsultationListView {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
