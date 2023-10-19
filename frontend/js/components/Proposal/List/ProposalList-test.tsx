/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalList } from './ProposalList'
import { $refType, $fragmentRefs } from '../../../mocks'

describe('<ProposalList />', () => {
  const emptyStep = {
    id: '1',
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  }
  const proposals = {
    ' $fragmentRefs': $fragmentRefs,
    ' $refType': $refType,
    totalCount: 0,
    edges: [],
  }
  it('should not render list if proposal is not provided', () => {
    const wrapper = shallow(<ProposalList proposals={proposals} step={emptyStep} viewer={null} />)
    expect(wrapper.children()).toHaveLength(1)
    expect(wrapper).toMatchSnapshot()
  })
  const collectStep = {
    id: '1',
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  }
  const proposalsList = {
    totalCount: 2,
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    edges: [
      {
        node: {
          id: '1',
          ' $fragmentRefs': $fragmentRefs,
        },
      },
      {
        node: {
          id: '2',
          ' $fragmentRefs': $fragmentRefs,
        },
      },
    ],
  }
  it('should render a collectStep proposal list', () => {
    const wrapper = shallow(<ProposalList proposals={proposalsList} step={collectStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  const selectionStep = {
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
  }
  it('should render a selectionStep proposal list', () => {
    const wrapper = shallow(<ProposalList proposals={proposalsList} step={selectionStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  const collectInterpellationStep = {
    form: {
      objectType: 'PROPOSAL',
    },
    project: {
      type: {
        title: 'project.types.interpellation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
  }
  const collectEstablishmentStep = {
    form: {
      objectType: 'ESTABLISHMENT',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
  }
  const collectQuestionStep = {
    form: {
      objectType: 'QUESTION',
    },
    project: {
      type: {
        title: 'global.consultation',
      },
    },
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    id: '1',
  }
  it('should render a collectStep interpellation list', () => {
    const wrapper = shallow(<ProposalList proposals={proposalsList} step={collectInterpellationStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a collectStep establishment list', () => {
    const wrapper = shallow(<ProposalList proposals={proposalsList} step={collectEstablishmentStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a collectStep with empty interpellation list', () => {
    const wrapper = shallow(<ProposalList proposals={proposals} step={collectInterpellationStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a collectStep with empty question list', () => {
    const wrapper = shallow(<ProposalList proposals={proposals} step={collectQuestionStep} viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
})
