/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisUserRow } from './ProposalAnalysisUserRow'
import { $fragmentRefs, $refType } from '~/mocks'

describe('<ProposalAnalysisUserRow />', () => {
  it('renders correctly', () => {
    const props = {
      user: {
        displayName: 'Goultard',
        id: 'id',
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      status: 'IN_PROGRESS',
      canEdit: true,
      canConsult: true,
      disabled: false,
    }
    const wrapper = shallow(<ProposalAnalysisUserRow {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
