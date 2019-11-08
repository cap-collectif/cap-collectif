// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import MetricsBox from './MetricsBox';

describe('<MetricsBox />', () => {
  it('should render data', () => {
    const wrapper = shallow(
      <MetricsBox color="red" totalCount={100} icon="cap-file-1" label="que la miff" />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
