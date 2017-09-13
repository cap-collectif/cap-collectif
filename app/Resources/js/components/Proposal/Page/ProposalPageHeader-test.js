/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageHeader } from './ProposalPageHeader';

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
    referer: 'http://capco.test',
  };

  const props = {
    userHasVote: false,
    onVote: () => {},
    referer: 'http://capco.test',
  };

  // it('should render a proposal header', () => {
  //   const wrapper = shallow(
  //     <ProposalPageHeader proposal={proposal} {...props} />,
  //   );
  // const mainDiv = wrapper.find('div.proposal__header');
  // expect(mainDiv).toHaveLength(1);
  // const title = mainDiv.find('h1');
  // expect(title).toHaveLength(1);
  // expect(title.prop('className')).toEqual('consultation__header__title h1');
  // expect(title.text()).toEqual(proposal.title);
  // const mediaDiv = mainDiv.find('div.media');
  // expect(mediaDiv).toHaveLength(1);
  // const avatar = mediaDiv.find('UserAvatar');
  // expect(avatar.prop('className')).toEqual('pull-left');
  // expect(avatar.prop('user')).toEqual(proposal.author);
  // const mediaBody = mediaDiv.find('div.media-body');
  // expect(mediaBody).toHaveLength(1);
  // const par = mediaBody.find('p.media--aligned.excerpt');
  // expect(par).toHaveLength(1);
  //
  // const proposalVoteWrapper = par.find('Connect(ProposalVoteButtonWrapper)');
  // expect(proposalVoteWrapper).toHaveLength(1);
  // expect(proposalVoteWrapper.props()).toEqual({
  //   proposal,
  //   className: 'visible-xs btn-lg pull-right',
  // });
  // });

  it('should not render theme if proposal has none', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposalWithoutTheme} {...props} />);
    const mainDiv = wrapper.find('div.proposal__header');
    const theme = mainDiv.find('p');
    expect(theme).toHaveLength(1);
  });

  it('should not render theme if specified not to', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} {...props} />);
    const mainDiv = wrapper.find('div.proposal__header');
    const theme = mainDiv.find('p');
    expect(theme).toHaveLength(1);
  });

  it('should render a div with specified classes', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={proposal} className="css-class" {...props} />,
    );
    const mainDiv = wrapper.find('div.proposal__header.css-class');
    expect(mainDiv).toHaveLength(1);
  });
});
