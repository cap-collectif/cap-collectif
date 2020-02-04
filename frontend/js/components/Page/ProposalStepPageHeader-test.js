// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalStepPageHeader } from '~/components/Page/ProposalStepPageHeader';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<ProposalStepPageHeader />', () => {
  const props = {
    step1: {
      $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        id: 'form1',
        $fragmentRefs,
        isProposalForm: true,
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
      $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        id: 'form1',
        $fragmentRefs,
        isProposalForm: true,
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
      $refType,
      id: 'step1',
      kind: 'selection',
      form: {
        id: 'form1',
        $fragmentRefs,
        isProposalForm: false,
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
      $refType,
      id: 'step1',
      kind: 'collect',
      form: {
        id: 'form1',
        $fragmentRefs,
        isProposalForm: true,
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
      $refType,
      id: 'step1',
      kind: 'collect',
      form: {
        id: 'form1',
        $fragmentRefs,
        isProposalForm: true,
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
  };

  it('renders with proposal context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step1} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with interpellation context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step2} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with question context in selection step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step3} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with proposal context in collect step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step4} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with interpellation context in collect step', () => {
    const wrapper = shallow(<ProposalStepPageHeader step={props.step5} />);
    expect(wrapper).toMatchSnapshot();
  });
});
