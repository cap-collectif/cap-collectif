// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionVotesBar } from './OpinionVotesBar';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionVotesBar />', () => {
  const opinionProps = {
    opinion: {
      __typename: 'Opinion',
      votesYes: {
        totalCount: 0,
      },
      previewVotes: {
        totalCount: 20,
        edges: [
          {
            node: $fragmentRefs,
          },
        ],
      },
      section: {
        votesThreshold: 20,
        votesThresholdHelpText: 'help',
      },
      $refType,
      $fragmentRefs,
    },
  };

  const versionProps = {
    opinion: {
      __typename: 'Version',
      votesYes: {
        totalCount: 0,
      },
      previewVotes: {
        totalCount: 20,
        edges: [],
      },
      section: {
        votesThreshold: 20,
        votesThresholdHelpText: 'help',
      },
      $refType,
      $fragmentRefs,
    },
  };

  const otherProps = {
    opinion: {
      __typename: '%other',
      $refType,
    },
  };

  it('should render correctly an opinion', () => {
    const wrapper = shallow(<OpinionVotesBar {...opinionProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly a version', () => {
    const wrapper = shallow(<OpinionVotesBar {...versionProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly something else', () => {
    const wrapper = shallow(<OpinionVotesBar {...otherProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
