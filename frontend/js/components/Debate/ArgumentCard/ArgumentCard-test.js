// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentCard } from './ArgumentCard';
import { $refType } from '~/mocks';

// This is WIP, the argument card will greatly evolve in the next PR(s)
describe('<ArgumentCard />', () => {
  const argument = {
    $refType,
    id: 'argumentPour42',
    body: 'Je suis pour le LSD dans nos cantines',
    votes: {
      totalCount: 500,
    },
    author: {
      username: 'Agui',
    },
    type: 'FOR',
    publishedAt: '01-02-2021:19h00',
    viewerHasVote: true,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ArgumentCard argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty on mobile', () => {
    const wrapper = shallow(<ArgumentCard isMobile argument={argument} />);
    expect(wrapper).toMatchSnapshot();
  });
});
