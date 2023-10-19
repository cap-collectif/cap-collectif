/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormAdminSettingsForm } from './ProposalFormAdminSettingsForm'
import { $refType, intlMock, formMock } from '../../mocks'

describe('<ProposalFormAdminSettingsForm />', () => {
  const defaultProps = {
    intl: intlMock,
    ...formMock,
    isSuperAdmin: true,
    isAdmin: true,
    isOrganizationMember: false,
    proposalForm: {
      ' $refType': $refType,
      id: 'proposalFormId',
      title: 'title',
      commentable: true,
      costable: true,
      suggestingSimilarProposals: true,
      canContact: false,
      nbrOfMessagesSent: 1,
    },
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminSettingsForm {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('organizationMember can toggle comments', () => {
    const props = { ...defaultProps, isSuperAdmin: false, isAdmin: false, isOrganizationMember: true }
    const wrapper = shallow(<ProposalFormAdminSettingsForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
