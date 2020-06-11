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
    isAuthenticated: false,
  };

  it('renders correctly in french', () => {
    const wrapper = shallow(<EventPage {...props} locale="fr-FR" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly in english', () => {
    const wrapper = shallow(<EventPage {...props} locale="en-GB" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without title and body', () => {
    const wrapper = shallow(
      <EventPage
        backgroundColor="red"
        eventPageTitle=""
        eventPageBody=""
        isAuthenticated={false}
        locale="fr-FR"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
