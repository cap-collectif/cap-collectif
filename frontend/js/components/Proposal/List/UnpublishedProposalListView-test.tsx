/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { UnpublishedProposalListView } from './UnpublishedProposalListView'
import { $refType, $fragmentRefs } from '../../../mocks'

describe('<UnpublishedProposalListView />', () => {
  const viewer = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  }
  it('renders nothing when empty', () => {
    const step = {
      id: 'step1',
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
      viewerProposalsUnpublished: null,
    }
    const wrapper = shallow(<UnpublishedProposalListView viewer={viewer} step={step} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty', () => {
    const step = {
      id: 'step1',
      ' $refType': $refType,
      ' $fragmentRefs': $fragmentRefs,
      viewerProposalsUnpublished: {
        ' $fragmentRefs': $fragmentRefs,
        totalCount: 1,
        edges: [
          {
            node: {
              id: 'proposal1',
              notPublishedReason: 'WAITING_AUTHOR_CONFIRMATION',
            },
          },
        ],
      },
    }
    const wrapper = shallow(<UnpublishedProposalListView viewer={viewer} step={step} />)
    expect(wrapper).toMatchSnapshot()
  })
})
