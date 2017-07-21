/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { ProposalList } from './ProposalList';

describe('<ProposalList />', () => {
  const proposals = [
    {
      id: 1,
      body: 'test1',
    },
    {
      id: 2,
      body: 'test2',
    },
  ];

  const step = {
    id: 1,
    title: 'Step 1',
    open: 'false',
  }
  ;

  it('should not render list if proposal is not provided', () => {
    const wrapper = shallow(<ProposalList step={step} proposals={[]} {...IntlData} />);
    expect(wrapper.children()).toHaveLength(1);
    expect(wrapper.children().text()).toEqual(IntlData.messages.proposal.private.empty);
  });

  it('should render a proposal list', () => {
    const wrapper = shallow(<ProposalList step={step} proposals={proposals} {...IntlData} />);
    expect(wrapper.find('ProposalPreview')).toHaveLength(2);
  });
});
