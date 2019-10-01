// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPageHeader } from './EventPageHeader';
import { intlMock } from '../../mocks';
import { features } from '../../redux/modules/default';

describe('<EventPageHeader />', () => {
  const props = {
    eventPageTitle: '<p>Titre personnalisé</p>',
    intl: intlMock,
    isAuthenticated: true,
    features: {
      ...features,
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<EventPageHeader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without title', () => {
    const noTitle = {
      ...props,
      eventPageTitle: '',
    };
    const wrapper = shallow(<EventPageHeader {...noTitle} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a non authenticated user', () => {
    const nonAuthenticated = {
      ...props,
      isAuthenticated: false,
    };
    const wrapper = shallow(<EventPageHeader {...nonAuthenticated} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with the create event feature toggle set to true', () => {
    const createEventTrue = {
      ...props,
      features: {
        ...features,
        allow_users_to_propose_events: true,
      },
    };
    const wrapper = shallow(<EventPageHeader {...createEventTrue} />);
    expect(wrapper).toMatchSnapshot();
  });
});
