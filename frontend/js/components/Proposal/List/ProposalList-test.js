// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalList } from './ProposalList';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalList />', () => {
  const emptyStep = {
    id: '1',
    $refType,
    $fragmentRefs,
  };

  const proposals = {
    $fragmentRefs,
    $refType,
    totalCount: 0,
    edges: [],
  };

  it('should not render list if proposal is not provided', () => {
    const wrapper = shallow(<ProposalList proposals={proposals} step={emptyStep} viewer={null} />);
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  const collectStep = {
    id: '1',
    $refType,
    $fragmentRefs,
  };

  const proposalsList = {
    totalCount: 2,
    $refType,
    $fragmentRefs,
    edges: [{ node: { id: '1', $fragmentRefs } }, { node: { id: '2', $fragmentRefs } }],
  };

  it('should render a collectStep proposal list', () => {
    const wrapper = shallow(
      <ProposalList proposals={proposalsList} step={collectStep} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  const selectionStep = {
    $refType,
    $fragmentRefs,
    id: '1',
  };

  it('should render a selectionStep proposal list', () => {
    const wrapper = shallow(
      <ProposalList proposals={proposalsList} step={selectionStep} viewer={null} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
