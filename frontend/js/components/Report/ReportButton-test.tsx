/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ReportButton } from './ReportButton'

describe('<ReportButton />', () => {
  const defaultProps = {
    id: 'opinion-1',
    user: {},
    reported: false,
    onClick: () => {},
  }
  it('renders clickable button', () => {
    const button = shallow(<ReportButton {...defaultProps} />)
      .find('Connect(LoginOverlay)')
      .find('button')
    expect(button.prop('id')).toEqual('report-opinion-1-button')
    expect(button.prop('onClick')).toBeDefined()
    expect(button.prop('className')).toEqual('btn btn-default btn-md')
    expect(button.prop('style')).toEqual({})
  })
  it('renders a reported button', () => {
    const button = shallow(<ReportButton {...defaultProps} reported />)
      .find('Connect(LoginOverlay)')
      .find('button')
    expect(button).toHaveLength(1)
    expect(button.prop('disabled')).toEqual(true)
    expect(button.prop('className')).toEqual('btn btn-default btn-md active')
  })
})
