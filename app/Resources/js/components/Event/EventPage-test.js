// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPage } from './EventPage';

describe('<EventPage />', () => {
  const props = {
    eventPageTitle: 'Titre personnalisé',
    eventPageBody: 'Description',
  };

  it('renders correcty', () => {
    const wrapper = shallow(<EventPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
