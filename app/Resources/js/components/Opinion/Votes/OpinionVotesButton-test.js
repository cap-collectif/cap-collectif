// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { OpinionVotesButton } from './OpinionVotesButton';
import {
  VOTE_WIDGET_DISABLED,
  VOTE_WIDGET_SIMPLE,
  VOTE_WIDGET_BOTH,
} from '../../../constants/VoteConstants';

const defaultStep = {
  $fragmentRefs,
  requirements: {
    viewerMeetsTheRequirements: true,
  },
};

describe('<OpinionVotesButton />', () => {
  const defaultProps = {
    dispatch: jest.fn(),
  };
  const opinionVoteBoth = {
    $refType,
    __typename: 'Opinion',
    id: '1',
    contribuable: true,
    viewerVote: null,
    section: { voteWidgetType: VOTE_WIDGET_BOTH },
    step: defaultStep,
  };

  const opinionVoteSimple = {
    $refType,
    __typename: 'Opinion',
    id: '1',
    contribuable: true,
    viewerVote: null,
    section: { voteWidgetType: VOTE_WIDGET_SIMPLE },
    step: defaultStep,
  };

  const opinionVoteDisabled = {
    $refType,
    __typename: 'Opinion',
    id: '1',
    contribuable: true,
    viewerVote: null,
    section: { voteWidgetType: VOTE_WIDGET_DISABLED },
    step: defaultStep,
  };

  it('should render a green button when value is 1 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value="YES" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render an orange button when value is 0 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value="MITIGE" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a red button when value is -1 and vote type is both', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteBoth} value="NO" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a green button when value is 1 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value="YES" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 0 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value="MITIGE" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is -1 and vote type is simple', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteSimple} value="NO" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 1 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value="YES" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is 0 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value="MITIGE" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a button when value is -1 and vote type is disabled', () => {
    const wrapper = shallow(
      <OpinionVotesButton {...defaultProps} opinion={opinionVoteDisabled} value="NO" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
