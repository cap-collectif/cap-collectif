/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageOfficialAnswer } from './ProposalPageOfficialAnswer';
import { $refType } from '~/mocks';

describe('<ProposalPageOfficialAnswer />', () => {
  const emptyProposal = {
    $refType,
    id: 'proposal1',
    officialResponse: null,
  };

  const proposal = {
    ...emptyProposal,
    officialResponse: {
      id: 'news1',
      body: 'GG mec c accepté',
      publishedAt: '2020_06_07',
      isPublished: true,
      authors: [{ id: 'author1', username: 'moi', media: null }],
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageOfficialAnswer proposal={proposal} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly without an official answer', () => {
    const wrapper = shallow(<ProposalPageOfficialAnswer proposal={emptyProposal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
