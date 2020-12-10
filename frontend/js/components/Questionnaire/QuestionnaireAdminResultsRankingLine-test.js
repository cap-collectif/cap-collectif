// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsRankingLine } from './QuestionnaireAdminResultsRankingLine';
import { $refType } from '~/mocks';

const baseProps = {
  choice: {
    $refType,
    title: 'First choice',
    ranking: [
      { position: 1, responses: { totalCount: 98 } },
      { position: 2, responses: { totalCount: 8 } },
      { position: 3, responses: { totalCount: 3 } },
    ],
  },
  choicesNumber: 3,
};

const props = {
  emptyRanking: {
    ...baseProps,
    choice: {
      ...baseProps.choice,
      ranking: [],
    },
  },
  halfFilledRanking: {
    ...baseProps,
    choice: {
      ...baseProps.choice,
      ranking: [],
    },
    choicesNumber: 7,
  },
  oneRanking: {
    ...baseProps,
    choice: {
      ...baseProps.choice,
      ranking: [{ position: 3, responses: { totalCount: 7897 } }],
    },
  },
  fullRanking: baseProps,
};

describe('<QuestionnaireAdminResultsRankingLine />', () => {
  it('renders correctly empty ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...props.emptyRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly half-filled ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...props.halfFilledRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly one ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...props.oneRanking} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly full ranking', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRankingLine {...props.fullRanking} />);
    expect(wrapper).toMatchSnapshot();
  });
});
