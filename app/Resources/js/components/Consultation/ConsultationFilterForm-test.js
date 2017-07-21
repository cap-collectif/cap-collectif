// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ConsultationFilterForm } from './ConsultationFilterForm';
import IntlData from '../../translations/FR';

describe('<ConsultationFilterForm />', () => {
  const props = {
    ...IntlData,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationFilterForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
