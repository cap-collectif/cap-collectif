/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeaPageVotes } from './IdeaPageVotes';

const fetchIdeaVotes = () => {};
const idea = {
  id: 1,
  votesCount: 2,
  votes: [
    {},
    {},
  ],
};

const ideaWithNoVotes = {
  id: 1,
  votesCount: 0,
  votes: [],
};

const ideaWithLoadsOfVotes = {
  id: 1,
  votesCount: 11,
  votes: [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ],
};

describe('<IdeaPageVotes />', () => {
  it('it should render nothing when idea has no votes', () => {
    const wrapper = shallow(
      <IdeaPageVotes
        fetchIdeaVotes={fetchIdeaVotes}
        idea={ideaWithNoVotes}
        {...IntlData}
      />,
    );
    expect(wrapper.children()).toHaveLength(0);
  });

  it('it should render as many votes as provided', () => {
    const wrapper = shallow(
      <IdeaPageVotes
        fetchIdeaVotes={fetchIdeaVotes}
        idea={idea}
        {...IntlData}
      />,
    );
    expect(wrapper.find('.idea__votes')).toHaveLength(1);
    expect(wrapper.find('h2')).toHaveLength(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages.find({ num: idea.votesCount })).toHaveLength(1);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('UserBox')).toHaveLength(2);

    const modal = wrapper.find('AllVotesModal');
    expect(modal).toHaveLength(1);
    expect(modal.prop('votes')).toEqual(idea.votes);
    expect(modal.prop('onToggleModal')).toBeDefined();
    expect(modal.prop('showModal')).toEqual(wrapper.state('showModal'));
    expect(wrapper.find('.idea__votes__show-more')).toHaveLength(0);
  });

  it('it should render show more button when idea has too much votes', () => {
    const wrapper = shallow(
      <IdeaPageVotes
        fetchIdeaVotes={fetchIdeaVotes}
        idea={ideaWithLoadsOfVotes}
        {...IntlData}
      />,
    );
    expect(wrapper.find('.idea__votes__show-more')).toHaveLength(1);
  });
});
