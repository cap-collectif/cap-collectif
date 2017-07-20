// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasIndexHeader from './IdeasIndexHeader';

const description = '<p>blabla</p>';

describe('<IdeasIndexHeader />', () => {
  it('should render ideas index description when provided', () => {
    const wrapper = shallow(
      <IdeasIndexHeader description={description} {...IntlData} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render empty container when description is not provided', () => {
    const wrapper = shallow(<IdeasIndexHeader {...IntlData} />);
    expect(wrapper).toMatchSnapshot();
  });
});
