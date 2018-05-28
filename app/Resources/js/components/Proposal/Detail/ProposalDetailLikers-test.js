// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalDetailLikers } from './ProposalDetailLikers';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalDetailLikers />', () => {
  const proposalWithoutLikers = {
    $refType,
    $fragmentRefs,
    id: '1',
    likers: [],
  };

  it('should not render anything when proposal has no likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithoutLikers} />);
    expect(wrapper).toMatchSnapshot();
  });

  const proposalWithLikers = {
    $refType,
    $fragmentRefs,
    id: '1',
    likers: [
      {
        id: '1',
      },
    ],
  };

  it('should render a <OverlayTrigger /> with <Tooltip /> when proposal has likers', () => {
    const wrapper = shallow(<ProposalDetailLikers proposal={proposalWithLikers} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a div when specified', () => {
    const wrapper = shallow(
      <ProposalDetailLikers componentClass="div" proposal={proposalWithLikers} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
