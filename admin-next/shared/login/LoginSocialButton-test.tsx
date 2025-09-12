/* eslint-env jest */
import { render } from '@testing-library/react'
import { LoginSocialButton } from './LoginSocialButton'
import MockProviders from 'tests/testUtils'

const baseProps = {
  primaryColor: '#fffeee',
  colorText: '#fff',
}

const getTree = props =>
  render(
    <MockProviders>
      <LoginSocialButton {...props} />
    </MockProviders>,
  )

describe('<LoginSocialButton />', () => {
  it('should render correctly', () => {
    const props = { ...baseProps, type: 'facebook', switchUserMode: false }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('should render correctly franceConnect', () => {
    const props = { ...baseProps, type: 'franceConnect', switchUserMode: false }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('should render correctly with grandLyonConnect', () => {
    const props = { ...baseProps, type: 'openId', text: 'grandLyonConnect' }
    expect(getTree(props)).toMatchSnapshot()
  })
  it('should render correctly with switchusermode', () => {
    const props = { ...baseProps, type: 'openId', switchUserMode: true, text: 'openid' }
    expect(getTree(props)).toMatchSnapshot()
  })
})
