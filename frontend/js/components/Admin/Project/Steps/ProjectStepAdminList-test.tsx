/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProjectStepAdminList } from './ProjectStepAdminList'
import { $fragmentRefs, $refType } from '~/mocks'

const defaultStep = {
  id: '1',
  title: 'testStep',
  label: 'label',
  __typename: 'typeTest',
  url: 'urlTest',
  slug: 'slugTest',
  hasOpinionsFilled: false,
  debateType: 'FACE_TO_FACE',
}
const defaultProps = {
  dispatch: jest.fn(),
  formName: 'oui',
  steps: [defaultStep, defaultStep],
  fields: {
    length: 0,
    map: () => [],
    remove: jest.fn(),
  },
  project: {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
  },
  hasIdentificationCodeLists: true,
  query: {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
  },
}
describe('<ProjectStepAdminList />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminList {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
