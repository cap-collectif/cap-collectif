// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPageHeader } from './EventPageHeader';
import { $refType } from '../../mocks';

describe('<EventPageHeader />', () => {
  const props = {
    query: {
      events: {
        totalCount: 10,
      },
      $refType,
    },
    eventPageTitle: 'Titre personnalisé',
  };

  it('renders correcty', () => {
    const wrapper = shallow(<EventPageHeader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
