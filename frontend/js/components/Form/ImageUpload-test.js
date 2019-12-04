// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ImageUpload from './ImageUpload';

const id = 'id';
const className = 'css-class';

describe('<ImageUpload />', () => {
  const props = {
    id,
    className,
    value: {
      id: 'media1',
      url: 'http://capco.dev',
      name: 'image.jpg',
      size: 42,
    },
    accept: '',
    onChange: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<ImageUpload {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly without preview', () => {
    const wrapper = shallow(<ImageUpload {...props} disablePreview />);
    expect(wrapper).toMatchSnapshot();
  });
});
