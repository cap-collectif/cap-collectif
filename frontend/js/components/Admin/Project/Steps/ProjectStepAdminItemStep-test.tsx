/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectStepAdminItemStep } from './ProjectStepAdminItemStep'
import { $fragmentRefs, $refType } from '~/mocks'

const defaultStep = {
  id: '1',
  title: 'testStep',
  label: 'label',
  __typename: 'QuestionnaireStep',
  url: 'urlTest',
  slug: 'slugTest',
  hasOpinionsFilled: false,
  debateType: 'FACE_TO_FACE',
}
const defaultProps = {
  formName: 'oui',
  index: 0,
  step: defaultStep,
  fields: {
    length: 0,
    map: () => [],
    remove: jest.fn(),
  },
  project: {
    _id: 'project123',
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
    steps: [
      {
        __typename: 'SelectionStep',
      },
    ],
  },
  hasIdentificationCodeLists: true,
  query: {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
  },
}
describe('<ProjectStepAdminItemStep />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminItemStep {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders collect step disabled when there is selection step', () => {
    const asCollectStep = { ...defaultProps, step: { ...defaultProps.step, __typename: 'CollectStep' } }
    const wrapper = shallow(<ProjectStepAdminItemStep {...asCollectStep} />)
    expect(wrapper).toMatchSnapshot()
  })
})
