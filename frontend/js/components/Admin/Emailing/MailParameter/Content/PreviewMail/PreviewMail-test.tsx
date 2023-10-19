/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { PreviewMail } from './PreviewMail'
import { $refType } from '~/mocks'

const baseProps = {
  reference: {
    current: null,
  },
  emailingCampaign: {
    ' $refType': $refType,
    preview: '<html>Voilà</html>',
    content: 'voilà',
  },
}
const props = {
  basic: baseProps,
  noContent: {
    ...baseProps,
    emailingCampaign: {
      ' $refType': $refType,
      content: '',
      preview: '',
    },
  },
}
describe('<PreviewMail />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<PreviewMail {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should renders correctly when no content', () => {
    const wrapper = shallow(<PreviewMail {...props.noContent} />)
    expect(wrapper).toMatchSnapshot()
  })
})
