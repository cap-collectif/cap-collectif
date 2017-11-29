// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { PreviewMedia } from './PreviewMedia';

describe('<PreviewMedia />', () => {
  const props = {
    currentMedias: [{ name: 'image', extension: 'jpg', url: 'http://capco.dev/image.jpg' }],
    newMedias: [],
    onRemoveMedia: jest.fn(),
  };

  it('should render correctly', () => {
    const wrapper = shallow(<PreviewMedia {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without medias', () => {
    const wrapper = shallow(
      <PreviewMedia currentMedias={[]} newMedias={[]} onRemoveMedia={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
