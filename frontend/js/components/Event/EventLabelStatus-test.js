// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventLabelStatus } from './EventLabelStatus';
import { $refType } from '~/mocks';

describe('<EventLabelStatus />', () => {
  const props = {
    event: {
      review: { id: 'review11', status: 'REFUSED', refusedReason: 'SPAM' },
      $refType,
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<EventLabelStatus {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
