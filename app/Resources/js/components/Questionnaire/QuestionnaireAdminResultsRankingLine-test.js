// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsRankingLine } from './QuestionnaireAdminResultsRankingLine';

describe('<QuestionnaireAdminResultsRankingLine />', () => {
  const emptyRanking = {
    choice: {
      title: 'First choice',
      ranking: [],
    },
    choicesNumber: 6,
  };

  const halfFilledRanking = {
    choice: {
      title: 'First choice',
      ranking: [
        { position: 2, responses: { totalCount: 7897 } },
        { position: 4, responses: { totalCount: 68 } },
        { position: 6, responses: { totalCount: 403 } },
      ],
    },
    choicesNumber: 7,
  };

  const oneRanking = {
    choice: {
      title: 'First choice',
      ranking: [{ position: 3, responses: { totalCount: 7897 } }],
    },
    choicesNumber: 3,
  };

  const fullRanking = {
    choice: {
      title: 'First choice',
      ranking: [
        { position: 1, responses: { totalCount: 98 } },
        { position: 2, responses: { totalCount: 8 } },
        { position: 3, responses: { totalCount: 3 } },
      ],
    },
    choicesNumber: 3,
  };

  it('renders correctly empty ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...emptyRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly half-filled ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...halfFilledRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly one ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...oneRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly full ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...fullRanking} />);
    expect(wrapper).toMatchSnapshot();
  });
});
