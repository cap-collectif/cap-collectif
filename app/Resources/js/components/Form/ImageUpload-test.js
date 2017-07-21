/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ImageUpload from './ImageUpload';
import Input from '../Form/Input';

const valueLink = {};
const preview = 'image.png';
const id = 'id';
const className = 'css-class';

describe('<ImageUpload />', () => {
  it('should show the image upload field', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} />);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Col')).toHaveLength(2);
    const dropzone = wrapper.find('Dropzone');
    expect(dropzone).toHaveLength(1);
    expect(dropzone.find('.image-uploader__dropzone-label')).toHaveLength(1);
    const button = wrapper.find('Button');
    expect(button.prop('className')).toEqual('image-uploader__btn');
    expect(wrapper.find('.image-uploader__preview')).toHaveLength(1);
    expect(wrapper.find('img')).toHaveLength(0);
    expect(wrapper.find(Input)).toHaveLength(0);
  });

  it('should show the preview and the delete checkbox if preview is provided', () => {
    const wrapper = shallow(
      <ImageUpload valueLink={valueLink} preview={preview} />,
    );
    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find(Input)).toHaveLength(1);
  });

  it('should show the provided id', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} id={id} />);
    expect(wrapper.find('Row').prop('id')).toEqual(id);
  });

  it('should show the provided classes', () => {
    const wrapper = shallow(
      <ImageUpload valueLink={valueLink} className={className} />,
    );
    expect(wrapper.find('Row').prop('className')).toEqual(
      `image-uploader ${className}`,
    );
  });
});
