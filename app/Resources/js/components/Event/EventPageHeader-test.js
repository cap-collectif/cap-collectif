// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventPageHeader } from './EventPageHeader';

describe('<EventPageHeader />', () => {
  const props = {
    eventPageTitle: '<p>Titre personnalisé</p>',
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
