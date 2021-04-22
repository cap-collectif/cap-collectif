// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DebateStepPageLinkedArticles } from './DebateStepPageLinkedArticles';
import { $refType, $fragmentRefs } from '~/mocks';

const baseProps = {
  isMobile: false,
  step: {
    id: 'stepId',
    $fragmentRefs,
    $refType,
    debate: {
      url: '/debate',
      articles: {
        edges: [
          {
            node: {
              id: 'article1',
              url: 'lemonde.fr/pour-ou-contre-omar',
              coverUrl: 'omar-au-jaccuzi.jpec',
              title: 'Omar, oui ou non ?',
              publishedAt: '2020-20-04:04:05:32',
              origin: 'Poitou Charentes',
            },
          },
          {
            node: {
              id: 'article2',
              url: 'lexpress.fr/omar-un-sujet-polarisant',
              coverUrl: 'omar-au-ski.jpec',
              title: 'Omar, tout le monde en parle',
              publishedAt: '2020-13-05:02:17:30',
              origin: 'Meurthe et Mozelle',
            },
          },
          {
            node: {
              id: 'article4',
              url: 'lefigaro.fr/omar-ma-tuer',
              coverUrl: null,
              title: 'Omar ma tuer',
              publishedAt: null,
              origin: null,
            },
          },
          {
            node: {
              id: 'article5',
              url: 'lecanarddechainé.fr/omar-le-bg',
              coverUrl: 'omar-a-la-plage.jpec',
              title: 'Omar, yen a marre',
              publishedAt: '2010-10-10:01:01:21',
              origin: null,
            },
          },
        ],
      },
    },
  },
};

describe('<DebateStepPageLinkedArticles />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DebateStepPageLinkedArticles {...baseProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageLinkedArticles {...baseProps} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });
});
