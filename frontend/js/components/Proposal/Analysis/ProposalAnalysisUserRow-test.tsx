/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalAnalysisUserRow } from './ProposalAnalysisUserRow'
import { $fragmentRefs, $refType } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
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
