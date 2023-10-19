/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { $fragmentRefs, $refType } from '../../mocks'
import { ConsultationListView } from './ConsultationListView'

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
