// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionVotesBox } from './OpinionVotesBox';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<OpinionVotesBox/>', () => {
  const opinionProps = {
    opinion: {
      votes: {
        totalCount: 3,
      },
      votesYes: {
        totalCount: 1,
      },
      votesNo: {
        totalCount: 1,
      },
      votesMitige: {
        totalCount: 1,
      },
      section: {
        voteWidgetType: 1,
        votesHelpText: 'help',
      },
      $refType,
      $fragmentRefs,
    },
  };

  it('should render correctly an opinion box', () => {
    const wrapper = shallow(<OpinionVotesBox {...opinionProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
