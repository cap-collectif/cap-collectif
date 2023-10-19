import * as React from 'react'
import { shallow } from 'enzyme'
import QuestionnaireAdminResultsPdfModalButton from './QuestionnaireAdminResultsPdfModalButton'

describe('<QuestionnaireAdminResultsPdfModalButton />', () => {
  const props = {
    loading: false,
    onClose: jest.fn(),
    error: false,
    setLoading: jest.fn(),
    retryCount: 0,
    setRetryCount: jest.fn(),
  }
  const loadingProps = { ...props, loading: true }
  const errorProps = { ...props, error: true }
  const retryCountExceedsLimitProps = { ...errorProps, retryCount: 1 }
  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when loading', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalButton {...loadingProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when error', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalButton {...errorProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when error and retryCount exceeds limit', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalButton {...retryCountExceedsLimitProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
