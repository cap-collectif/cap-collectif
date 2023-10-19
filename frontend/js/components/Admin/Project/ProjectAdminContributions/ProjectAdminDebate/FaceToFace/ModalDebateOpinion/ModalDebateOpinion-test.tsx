/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ModalDebateOpinion } from './ModalDebateOpinion'
import { $refType, formMock, intlMock } from '~/mocks'

const baseProps = {
  ...formMock,
  intl: intlMock,
  opinion: {
    ' $refType': $refType,
    id: 'opinion123',
    type: 'FOR',
    title: 'Pour ou contre la vie ?',
    body: 'Tell us the truth',
    bodyUsingJoditWysiwyg: false,
    author: {
      id: 'author123',
      username: 'SmokeWeedEveryday',
    },
  },
  debate: {
    ' $refType': $refType,
    id: 'debate123',
  },
  onClose: jest.fn(),
  type: 'FOR',
  show: true,
  isCreating: false,
}
const props = {
  editingOpinion: baseProps,
  creatingOpinion: { ...baseProps, isCreating: true, opinion: undefined },
}
describe('<ModalDebateOpinion />', () => {
  it('should render correctly when editing opinion', () => {
    const wrapper = shallow(<ModalDebateOpinion {...props.editingOpinion} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when creating opinion', () => {
    const wrapper = shallow(<ModalDebateOpinion {...props.creatingOpinion} />)
    expect(wrapper).toMatchSnapshot()
  })
})
