/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { TagThemes } from './TagThemes';
import { $refType } from '~/mocks';

const theme = {
  basic: [
    { $refType, title: 'Justice' },
    { $refType, title: 'Éducation' },
  ],
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
