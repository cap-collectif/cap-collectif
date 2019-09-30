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
    openModal: jest.fn(),
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
});
