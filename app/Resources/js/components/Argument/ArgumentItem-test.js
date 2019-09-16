// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentItem } from './ArgumentItem';
import { $refType, $fragmentRefs } from '../../mocks';

describe('<ArgumentItem />', () => {
  const defaultProps = {
    argument: {
      $refType,
      $fragmentRefs,
      id: 'argument1',
      createdAt: '2018-04-09T23:21:06+0200',
      publishedAt: '2018-04-09T23:21:06+0200',
      author: {
        $fragmentRefs,
        vip: false,
      },
      body:
        '<div>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</div>',
      type: 'FOR',
      related: {
        id: 'opinion1',
        url:
          'https://capco.dev/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-2',
        title: 'Opinion 1',
      },
    },
    isProfile: false,
  };

  const propsForProfile = {
    ...defaultProps,
    isProfile: true,
  };

  it('render correcty', () => {
    const wrapper = shallow(<ArgumentItem {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('render correcty on profile', () => {
    const wrapper = shallow(<ArgumentItem {...propsForProfile} />);

    expect(wrapper).toMatchSnapshot();
  });
});
