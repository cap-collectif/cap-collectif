// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import { $refType, $fragmentRefs, intlMock } from '../../mocks';

describe('<OpinionList />', () => {
  const props = {
    section: {
      $fragmentRefs,
      $refType,
      color: 'red',
      contribuable: true,
      contributionsCount: 0,
      id: 'id',
      slug: 'slug',
      url: 'https://capco.dev',
    },
    consultation: { id: 'consultation1', opinionCountShownBySection: 5, $refType, $fragmentRefs },
    intl: intlMock,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
