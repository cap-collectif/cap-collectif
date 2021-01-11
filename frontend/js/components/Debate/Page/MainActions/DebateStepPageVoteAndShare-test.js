// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageVoteAndShare } from './DebateStepPageVoteAndShare';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<DebateStepPageVoteAndShare/>', () => {
  const debate = {
    id: 'debate1',
    $refType,
    $fragmentRefs,
    votes: { totalCount: 5 },
    yesVotes: { totalCount: 4 },
  };

  const props = {
    title: 'Pour ou contre le LSD dans nos cantines',
    body: 'Oui je suis pour',
    isAuthenticated: true,
    url: '/debate1',
  };

  it('renders correcty', () => {
    const wrapper = shallow(<DebateStepPageVoteAndShare {...props} debate={debate} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty on mobile', () => {
    const wrapper = shallow(<DebateStepPageVoteAndShare {...props} debate={debate} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });
});
