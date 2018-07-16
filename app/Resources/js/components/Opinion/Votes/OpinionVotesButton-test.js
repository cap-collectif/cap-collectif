// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { OpinionVotesButton } from './OpinionVotesButton';
import {
  VOTE_WIDGET_DISABLED,
  VOTE_WIDGET_SIMPLE,
  VOTE_WIDGET_BOTH,
} from '../../../constants/VoteConstants';

describe('<OpinionVotesButton />', () => {
  const defaultProps = {
    active: true,
    features: {},
    dispatch: jest.fn(),
  };
  const opinionVoteBoth = {
    id: 1,
    section: {
      voteWidgetType: VOTE_WIDGET_BOTH,
    },
  };

  const opinionVoteSimple = {
    id: 1,
    section: {
      voteWidgetType: VOTE_WIDGET_SIMPLE,
    },
  };

  const opinionVoteDisabled = { id: 1, section: { voteWidgetType: VOTE_WIDGET_DISABLED } };

  it('should render a green button when value is 1 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value={1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render an orange button when value is 0 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value={0} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a red button when value is -1 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value={-1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a green button when value is 1 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value={1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 0 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value={0} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is -1 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value={-1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 1 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value={1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 0 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value={0} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is -1 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value={-1} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
