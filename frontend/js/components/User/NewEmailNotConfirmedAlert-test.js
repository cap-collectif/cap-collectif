// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { NewEmailNotConfirmedAlert } from './NewEmailNotConfirmedAlert';

describe('<NewEmailNotConfirmedAlert />', () => {
  it('should render nothing if no newEmailToConfirm', () => {
    const wrapper = shallow(<NewEmailNotConfirmedAlert />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render an alert if there is a newEmailToConfirm', () => {
    const wrapper = shallow(
      <NewEmailNotConfirmedAlert sendSucceed newEmailToConfirm="new-email@test.com" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
