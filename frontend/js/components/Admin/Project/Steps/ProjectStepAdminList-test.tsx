/* eslint-env jest */
import { shallow } from 'enzyme'
import * as React from 'react'
import { $fragmentRefs, $refType } from '~/mocks'
import { ProjectStepAdminList } from './ProjectStepAdminList'

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
// @ts-ignore legacy, won't be fixed
describe('<ProjectStepAdminList />', () => {
  // @ts-ignore legacy, won't be fixed
  it('renders correctly', () => {
    // @ts-ignore legacy, won't be fixed
    const wrapper = shallow(<ProjectStepAdminList {...defaultProps} />)
    // @ts-ignore legacy, won't be fixed
    expect(wrapper).toMatchSnapshot()
  })
})
