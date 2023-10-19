/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalCreateButton } from './ProposalCreateButton'
import { $refType } from '../../../mocks'

describe('<ProposalCreateButton />', () => {
  it('should render correctly', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        ' $refType': $refType,
        objectType: 'PROPOSAL',
      },
      projectType: 'global.consultation',
    }
    const wrapper = shallow(<ProposalCreateButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const props = {
      handleClick: jest.fn(),
      proposalForm: {
        ' $refType': $refType,
        objectType: 'PROPOSAL',
      },
      disabled: true,
      projectType: 'global.consultation',
    }
    const wrapper = shallow(<ProposalCreateButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly as Question', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        ' $refType': $refType,
        objectType: 'QUESTION',
      },
      projectType: 'global.consultation',
    }
    const wrapper = shallow(<ProposalCreateButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly as Interpellation', () => {
    const props = {
      handleClick: jest.fn(),
      disabled: false,
      proposalForm: {
        ' $refType': $refType,
        objectType: 'PROPOSAL',
      },
      projectType: 'project.types.interpellation',
    }
    const wrapper = shallow(<ProposalCreateButton {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
