// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import { $refType, intlMock } from '../../mocks';

describe('<OpinionList />', () => {
  const props = {
    section: {
      $refType,
      appendixTypes: [],
      color: 'red',
      contribuable: true,
      contributionsCount: 0,
      id: 'id',
      slug: 'slug',
      url: 'https://capco.dev',
    },
    consultation: {},
    intl: intlMock,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
