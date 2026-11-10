/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { createRoot, Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { IntlProvider } from 'react-intl'
import { ProposalPageMetadata } from './ProposalPageMetadata'
import { $refType, $fragmentRefs } from '~/mocks'

const baseProposal = {
  ' $refType': $refType,
  ' $fragmentRefs': $fragmentRefs,
  id: '1',
  estimation: null,
  viewerCanDecide: false,
  decision: null,
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
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ProposalPageMetadata />', () => {
  it('should render proposal page metadata', () => {
    const wrapper = shallow(
      <ProposalPageMetadata proposal={baseProposal} showCategories showDistricts showNullEstimation showThemes />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})

/**
 * @jest-status compliant
 * @jest-reason Checks visible cost text using a DOM render with an explicit locale and per-test cleanup.
 */
describe('proposal cost displayed to the viewer', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it.each([
    {
      name: 'the published cost for a decider with a draft',
      viewerCanDecide: true,
      estimation: 99996,
      decision: { estimatedCost: 100000, state: 'IN_PROGRESS' },
      expected: '€99,996',
    },
    {
      name: 'no cost when a draft has no published estimation',
      viewerCanDecide: true,
      estimation: null,
      decision: { estimatedCost: 22, state: 'IN_PROGRESS' },
      expected: '',
    },
    {
      name: 'the updated cost after the decision is published',
      viewerCanDecide: true,
      estimation: 22,
      decision: { estimatedCost: 22, state: 'DONE' },
      expected: '€22',
    },
    {
      name: 'the published cost while a validated decision is not yet applied',
      viewerCanDecide: true,
      estimation: 500,
      decision: { estimatedCost: 22, state: 'DONE' },
      expected: '€500',
    },
    {
      name: 'the published cost for another viewer',
      viewerCanDecide: false,
      estimation: 99996,
      decision: { estimatedCost: 100000, state: 'IN_PROGRESS' },
      expected: '€99,996',
    },
    {
      name: 'the published cost when the decision cost is missing',
      viewerCanDecide: true,
      estimation: 50000,
      decision: { estimatedCost: null },
      expected: '€50,000',
    },
    {
      name: 'the published cost when there is no decision',
      viewerCanDecide: true,
      estimation: 50000,
      decision: null,
      expected: '€50,000',
    },
    { name: 'a zero published cost', viewerCanDecide: false, estimation: 0, decision: null, expected: '€0' },
    {
      name: 'the published cost when a decider drafts a zero cost',
      viewerCanDecide: true,
      estimation: 50000,
      decision: { estimatedCost: 0, state: 'IN_PROGRESS' },
      expected: '€50,000',
    },
  ])('displays $name', ({ viewerCanDecide, estimation, decision, expected }) => {
    const proposal = { ...baseProposal, likers: [], viewerCanDecide, estimation, decision }

    act(() => {
      root.render(
        React.createElement(
          IntlProvider,
          { locale: 'en', messages: {} },
          <ProposalPageMetadata
            proposal={proposal}
            showCategories={false}
            showDistricts={false}
            showNullEstimation={false}
            showThemes={false}
          />,
        ),
      )
    })

    expect(container.textContent?.replace(/\s/g, '')).toBe(`${expected}Reference`)
  })
})
