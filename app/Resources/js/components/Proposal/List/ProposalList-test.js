/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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

  it('should not render list if proposal is not provided', () => {
    const wrapper = shallow(<ProposalList proposals={[]} {...IntlData} />);
    expect(wrapper.children()).to.have.length(1);
    expect(wrapper.children().text()).to.be.eql(IntlData.messages.proposal.private.empty);
  });

  it('should render a proposal list', () => {
    const wrapper = shallow(<ProposalList proposals={proposals} {...IntlData} />);
    expect(wrapper.find('ProposalPreview')).to.have.length(2);
  });
});
