/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MailingListItem } from './MailingListItem'
import { $refType } from '~/mocks'

const baseProps = {
  rowId: '1',
  mailingList: {
    ' $refType': $refType,
    id: '1',
    name: 'Je suis une mailing list',
    usersConsenting: {
      totalCount: 1,
    },
    project: {
      title: 'Je suis un titre de projet',
    },
  },
  selected: false,
  setMailingListSelected: jest.fn(),
}
const props = {
  basic: baseProps,
  selected: { ...baseProps, selected: true },
}
describe('<MailingListItem />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<MailingListItem {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly when selected', () => {
    const wrapper = shallow(<MailingListItem {...props.selected} />)
    expect(wrapper).toMatchSnapshot()
  })
})
