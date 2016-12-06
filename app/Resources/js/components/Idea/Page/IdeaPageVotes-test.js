/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
      />
    );
    expect(wrapper.children()).to.have.length(0);
  });

  it('it should render as many votes as provided', () => {
    const wrapper = shallow(
      <IdeaPageVotes
        fetchIdeaVotes={fetchIdeaVotes}
        idea={idea}
        {...IntlData}
      />
    );
    expect(wrapper.find('.idea__votes')).to.have.length(1);
    expect(wrapper.find('h2')).to.have.length(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages.find({ num: idea.votesCount })).to.have.length(1);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find('UserBox')).to.have.length(2);

    const modal = wrapper.find('AllVotesModal');
    expect(modal).to.have.length(1);
    expect(modal.prop('votes')).to.equal(idea.votes);
    expect(modal.prop('onToggleModal')).to.be.a('function');
    expect(modal.prop('showModal')).to.equal(wrapper.state('showModal'));
    expect(wrapper.find('.idea__votes__show-more')).to.have.length(0);
  });

  it('it should render show more button when idea has too much votes', () => {
    const wrapper = shallow(
      <IdeaPageVotes
        fetchIdeaVotes={fetchIdeaVotes}
        idea={ideaWithLoadsOfVotes}
        {...IntlData}
      />
    );
    expect(wrapper.find('.idea__votes__show-more')).to.have.length(1);
  });
});
