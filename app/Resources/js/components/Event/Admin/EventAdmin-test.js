// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventAdmin } from './EventAdmin';
import { intlMock } from '../../../mocks';

const defaultProps = {
  intl: intlMock,
  eventId: 'event1',
};

describe('<EventAdmin />', () => {
  it('it renders correctly with event Id', () => {
    const props = {
      ...defaultProps,
    };
    const wrapper = shallow(<EventAdmin {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly without event Id', () => {
    const props = {
      ...defaultProps,
      eventId: '',
    };
    const wrapper = shallow(<EventAdmin {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
