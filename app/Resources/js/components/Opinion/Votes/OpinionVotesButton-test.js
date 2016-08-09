/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { OpinionVotesButton } from './OpinionVotesButton';
import { VOTE_WIDGET_DISABLED, VOTE_WIDGET_SIMPLE, VOTE_WIDGET_BOTH } from '../../../constants/VoteConstants';

describe('<OpinionVotesButton />', () => {
  const opinionVoteBoth = {
    id: 1,
    type: {
      voteWidgetType: VOTE_WIDGET_BOTH,
    },
  };

  const opinionVoteSimple = {
    id: 1,
    type: {
      voteWidgetType: VOTE_WIDGET_SIMPLE,
    },
  };

  const opinionVoteDisabled = {
    id: 1,
    type: {
      voteWidgetType: VOTE_WIDGET_DISABLED,
    },
  };

  it('should render a green button when value is 1 and vote type is both', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteBoth} value={1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find({ bsStyle: 'success' })).to.have.length(1);
  });

  it('should render an orange button when value is 0 and vote type is both', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteBoth} value={0} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find({ bsStyle: 'warning' })).to.have.length(1);
  });

  it('should render a red button when value is -1 and vote type is both', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteBoth} value={-1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find({ bsStyle: 'danger' })).to.have.length(1);
  });

  it('should render a green button when value is 1 and vote type is simple', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteSimple} value={1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find({ bsStyle: 'success' })).to.have.length(1);
  });

  it('should not render a button when value is 0 and vote type is simple', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteSimple} value={0} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.not.exists;
  });

  it('should not render a button when value is -1 and vote type is simple', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteSimple} value={-1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.not.exists;
  });

  it('should not render a button when value is 1 and vote type is disabled', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteDisabled} value={1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.not.exists;
  });

  it('should not render a button when value is 0 and vote type is disabled', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteDisabled} value={0} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.not.exists;
  });

  it('should not render a button when value is -1 and vote type is disabled', () => {
    const wrapper = shallow(<OpinionVotesButton opinion={opinionVoteDisabled} value={-1} features={{}} {...IntlData} />);
    expect(wrapper.find('Button')).to.not.exists;
  });
});
