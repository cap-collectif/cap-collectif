/* eslint-env jest */
import * as React from 'react'
import * as hooks from 'react-redux'
import { shallow } from 'enzyme'
import { ProposalStepPageHeader } from '~/components/Page/ProposalStepPageHeader'
import { $fragmentRefs, $refType } from '../../mocks'

describe('<ProposalStepPageHeader />', () => {
  const props = {
    step1: {
      ' $refType': $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        contribuable: true,
        id: 'form1',
        ' $fragmentRefs': $fragmentRefs,
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'project.types.petition',
        },
      },
      allProposals: {
        totalCount: 5,
        fusionCount: 2,
      },
      proposals: {
        totalCount: 5,
        edges: [
          {
            node: {
              id: 'proposal1',
            },
          },
        ],
      },
    },
    step2: {
      ' $refType': $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        contribuable: true,
        id: 'form1',
        ' $fragmentRefs': $fragmentRefs,
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'project.types.interpellation',
        },
      },
      allProposals: {
        totalCount: 5,
        fusionCount: 2,
      },
      proposals: {
        totalCount: 5,
        edges: [
          {
            node: {
              id: 'proposal1',
            },
          },
        ],
      },
    },
    step3: {
      ' $refType': $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        contribuable: true,
        id: 'form1',
        ' $fragmentRefs': $fragmentRefs,
        objectType: 'QUESTION',
      },
      project: {
        type: {
          title: 'project.types.petition',
        },
      },
      allProposals: {
        totalCount: 5,
        fusionCount: 2,
      },
      proposals: {
        totalCount: 5,
        edges: [
          {
            node: {
              id: 'proposal1',
            },
          },
        ],
      },
    },
    step4: {
      ' $refType': $refType,
      id: 'step1',
      kind: 'collect',
      form: {
        contribuable: true,
        id: 'form1',
        ' $fragmentRefs': $fragmentRefs,
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'project.types.petition',
        },
      },
      allProposals: {
        totalCount: 5,
        fusionCount: 2,
      },
      proposals: {
        totalCount: 5,
        edges: [
          {
            node: {
              id: 'proposal1',
            },
          },
        ],
      },
    },
    step5: {
      ' $refType': $refType,
      id: 'step1',
      kind: 'collect',
      form: {
        contribuable: true,
        id: 'form1',
        ' $fragmentRefs': $fragmentRefs,
        objectType: 'PROPOSAL',
      },
      project: {
        type: {
          title: 'project.types.interpellation',
        },
      },
      allProposals: {
        totalCount: 5,
        fusionCount: 2,
      },
      proposals: {
        totalCount: 5,
        edges: [
          {
            node: {
              id: 'proposal1',
            },
          },
        ],
      },
    },
  }
  beforeEach(() => {
    jest.spyOn(hooks, 'useDispatch').mockImplementation(() => [{}, jest.fn()])
    jest.spyOn(hooks, 'useSelector').mockImplementation(() => [{}, jest.fn()])
  })
  it('renders with proposal context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step1} displayMode="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders with interpellation context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step2} displayMode="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders with question context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step3} displayMode="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders with proposal context in collect step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step4} displayMode="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders with interpellation context in collect step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step5} displayMode="GRID" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders with a map view', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step1} displayMode="MAP" />)
    expect(wrapper).toMatchSnapshot()
  })
})
