// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import { $refType, $fragmentRefs, intlMock } from '../../mocks';

describe('<OpinionList />', () => {
  const props = {
    enablePagination: false,
    section: {
      $fragmentRefs,
      $refType,
      color: 'red',
      contribuable: true,
      contributionsCount: 10,
      defaultOrderBy: 'positions',
      id: 'id',
      slug: 'slug',
      url: 'https://capco.dev',
    },
    consultation: { id: 'consultation1', opinionCountShownBySection: 5, $refType, $fragmentRefs },
    intl: intlMock,
  };

  it('renders correcty with pagination disabled', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correcty with pagination enabled', () => {
    const wrapper = shallow(<OpinionList {...props} enablePagination />);
    expect(wrapper).toMatchSnapshot();

    const orderBy = ['random', 'last', 'old', 'favorable', 'votes', 'comments'];
    for (const order of orderBy) {
      wrapper.find('select').simulate('change', { target: { value: order } });
      expect(wrapper).toMatchSnapshot();
    }
  });
});
