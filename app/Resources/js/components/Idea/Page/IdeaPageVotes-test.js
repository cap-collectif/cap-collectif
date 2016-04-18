/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageVotes from './IdeaPageVotes';
import UserBox from '../../User/UserBox';
import AllVotesModal from '../../Votes/AllVotesModal';
import { IDEA_VOTES_TO_SHOW } from '../../../constants/IdeaConstants';


const idea = {
  id: 1,
  votesCount: 2,
};

const ideaWithNoVotes = {
  id: 1,
  votesCount: 0,
};

const ideaWithLoadsOfVotes = {
  id: 1,
  votesCount: IDEA_VOTES_TO_SHOW + 3,
};

const votes = [
  {},
  {},
];

describe('<IdeaPageVotes />', () => {
  it('it should render nothing when idea has no votes', () => {
    const wrapper = shallow(<IdeaPageVotes idea={ideaWithNoVotes} votes={[]} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('it should render as many votes as provided', () => {
    const wrapper = shallow(<IdeaPageVotes idea={idea} votes={votes} {...IntlData} />);
    expect(wrapper.find('.idea__votes')).to.have.length(1);
    expect(wrapper.find('h2')).to.have.length(1);
    const messages = wrapper.find('FormattedMessage');
    expect(messages.find({ num: idea.votesCount })).to.have.length(1);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find(UserBox)).to.have.length(2);
    const modal = wrapper.find(AllVotesModal);
    expect(modal).to.have.length(1);
    expect(modal.prop('votes')).to.equal(wrapper.state('votes'));
    expect(modal.prop('onToggleModal')).to.be.a('function');
    expect(modal.prop('showModal')).to.equal(wrapper.state('showModal'));
    expect(wrapper.find('.idea__votes__show-more')).to.have.length(0);
  });

  it('it should render show more button when idea has too much votes', () => {
    const wrapper = shallow(<IdeaPageVotes idea={ideaWithLoadsOfVotes} votes={votes} {...IntlData} />);
    expect(wrapper.find('.idea__votes__show-more')).to.have.length(1);
  });
});
