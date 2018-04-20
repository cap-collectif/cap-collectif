// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalList } from './ProposalList';

describe('<ProposalList />', () => {
  const emptyStep = {
    id: '1',
    form: {
      proposals: {
        totalCount: 0,
        edges: [],
      },
    },
  };

  it('should not render list if proposal is not provided', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalList step={emptyStep} viewer={null} />);
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  const collectStep = {
    id: '1',
    form: {
      proposals: {
        totalCount: 2,
        edges: [{ node: { id: '1' } }, { node: { id: '2' } }],
      },
    },
  };

  it('should render a collectStep proposal list', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalList step={collectStep} viewer={null} />);
    expect(wrapper).toMatchSnapshot();
  });

  const selectionStep = {
    id: '1',
    proposals: {
      totalCount: 2,
      edges: [{ node: { id: '1' } }, { node: { id: '2' } }],
    },
  };

  it('should render a selectionStep proposal list', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalList step={selectionStep} viewer={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
