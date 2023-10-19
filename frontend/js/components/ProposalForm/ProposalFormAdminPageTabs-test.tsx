/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormAdminPageTabs } from './ProposalFormAdminPageTabs'
import { $fragmentRefs, intlMock, $refType } from '../../mocks'

describe('<ProposalFormAdminPageTabs />', () => {
  const proposalForm = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    url: 'http://capco.dev/top-budget',
    title: 'ceci est le titre du proposal form',
    step: {
      id: '<random id>',
    },
  }
  const props = {
    intl: intlMock,
    proposalForm,
    query: {
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('doesnt render a (new)  analysis tab, if form is not linked to a step yet', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} proposalForm={{ ...proposalForm, step: null }} />)
    expect(wrapper).toMatchSnapshot()
  })
})
