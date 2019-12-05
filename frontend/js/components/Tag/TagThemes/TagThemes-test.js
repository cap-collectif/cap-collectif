/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import TagThemes from './TagThemes';

const theme = {
  basic: [{ title: 'Justice' }, { title: 'Éducation' }],
};

describe('<TagThemes />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TagThemes themes={theme.basic} size="15px" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with other size', () => {
    const wrapper = shallow(<TagThemes themes={theme.basic} size="12px" />);
    expect(wrapper).toMatchSnapshot();
  });
});
