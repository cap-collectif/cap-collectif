/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProposalPageHeader from './ProposalPageHeader';
import IntlData from '../../../translations/FR';

describe('<ProposalPageHeader />', () => {
  const proposal = {
    theme: {
      title: 'Titre du thème',
    },
    title: 'Titre',
    author: {},
  };

  const proposalWithoutTheme = {
    title: 'Titre',
    author: {},
  };

  const props = {
    userHasVote: false,
    onVote: () => {},
  };

  it('should render a proposal header', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} showThemes {...props} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__header');
    expect(mainDiv).to.have.length(1);
    const theme = mainDiv.children().find('p').first();
    expect(theme.prop('className')).to.equal('excerpt');
    expect(theme.text()).to.equal('Titre du thème');
    const title = mainDiv.find('h1');
    expect(title).to.have.length(1);
    expect(title.prop('className')).to.equal('consultation__header__title h1');
    expect(title.text()).to.equal(proposal.title);
    const mediaDiv = mainDiv.find('div.media');
    expect(mediaDiv).to.have.length(1);
    const avatar = mediaDiv.find('UserAvatar');
    expect(avatar.prop('className')).to.equal('pull-left');
    expect(avatar.prop('user')).to.equal(proposal.author);
    const mediaBody = mediaDiv.find('div.media-body');
    expect(mediaBody).to.have.length(1);
    const par = mediaBody.find('p.media--aligned.excerpt');
    expect(par).to.have.length(1);

    const proposalVoteWrapper = par.find('Connect(ProposalVoteButtonWrapper)');
    expect(proposalVoteWrapper).to.have.length(1);
    expect(proposalVoteWrapper.props()).eql({ proposal, className: 'visible-xs pull-right' });
  });

  it('should not render theme if proposal has none', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposalWithoutTheme} showThemes {...props} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__header');
    const theme = mainDiv.find('p');
    expect(theme).to.have.length(1);
  });

  it('should not render theme if specified not to', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} showThemes={false} {...props} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__header');
    const theme = mainDiv.find('p');
    expect(theme).to.have.length(1);
  });

  it('should render a div with specified classes', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} showThemes className="css-class" {...props} {...IntlData} />);
    const mainDiv = wrapper.find('div.proposal__header.css-class');
    expect(mainDiv).to.have.length(1);
  });
});
