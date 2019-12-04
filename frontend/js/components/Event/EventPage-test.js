// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPage } from './EventPage';

describe('<EventPage />', () => {
  const props = {
    eventPageTitle: 'Titre personnalisé',
    eventPageBody: 'Description',
    backgroundColor: '#F6F6F6',
  };

  it('renders correctly', () => {
    const wrapper = shallow(<EventPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without title and body', () => {
    const wrapper = shallow(<EventPage backgroundColor="red" eventPageTitle="" eventPageBody="" />);
    expect(wrapper).toMatchSnapshot();
  });
});
