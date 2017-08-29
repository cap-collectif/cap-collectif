// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ConsultationFilterForm } from './ConsultationFilterForm';

describe('<ConsultationFilterForm />', () => {
  const props = {};

  it('renders correcty', () => {
    const wrapper = shallow(<ConsultationFilterForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
