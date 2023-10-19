/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalPageMetadata } from './ProposalPageMetadata'
import { $refType, $fragmentRefs } from '~/mocks'

const proposal = {
  ' $refType': $refType,
  ' $fragmentRefs': $fragmentRefs,
  id: '1',
  estimation: null,
  likers: [],
  category: {
    name: 'Nom de la catégorie',
  },
  district: {
    name: 'Nom du quartier',
  },
  reference: 'Reference',
  theme: null,
  isArchived: false,
  archiveLimitDate: null,
  votes: {
    totalCount: 0,
  },
  paperVotesTotalCount: 0,
  currentVotableStep: {
    title: 'step title',
    voteThreshold: 0,
  },
}
describe('<ProposalPageMetadata />', () => {
  it('should render proposal page metadata', () => {
    const wrapper = shallow(
      <ProposalPageMetadata proposal={proposal} showCategories showDistricts showNullEstimation showThemes />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
