// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentVoteButton } from './ArgumentVoteButton';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ArgumentVoteButton />', () => {
  const defaultStep = {
    $fragmentRefs,
    requirements: {
      viewerMeetsTheRequirements: true,
    },
  };

  it('renders when viewer is author', () => {
    const argument = {
      $refType,
      id: 'argument1',
      author: { slug: 'author', isViewer: true },
      contribuable: true,
      viewerHasVote: false,
      viewerVote: null,
      step: defaultStep,
    };
    const wrapper = shallow(<ArgumentVoteButton argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders viewer has not voted', () => {
    const argument = {
      $refType,
      id: 'argument1',
      author: { slug: 'author', isViewer: false },
      contribuable: true,
      viewerHasVote: false,
      viewerVote: null,
      step: defaultStep,
    };
    const wrapper = shallow(<ArgumentVoteButton argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders viewer has voted', () => {
    const argument = {
      $refType,
      id: 'argument1',
      author: { slug: 'author', isViewer: false },
      contribuable: true,
      viewerHasVote: true,
      viewerVote: { id: 'vote1', $fragmentRefs },
      step: defaultStep,
    };
    const wrapper = shallow(<ArgumentVoteButton argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });
});
