/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import ImageUpload from './ImageUpload';
import Input from '../Form/Input';

const valueLink = {};
const preview = 'image.png';
const id = 'id';
const className = 'css-class'

describe('<ImageUpload />', () => {
  it('should show the image upload field', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} {...IntlData} />);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find('Col')).to.have.length(2);
    const dropzone = wrapper.find('Dropzone');
    expect(dropzone).to.have.length(1);
    expect(dropzone.find('.image-uploader__dropzone-label')).to.have.length(1);
    const button = wrapper.find('Button');
    expect(button.prop('className')).to.equal('image-uploader__btn');
    expect(wrapper.find('.image-uploader__preview')).to.have.length(1);
    expect(wrapper.find('img')).to.have.length(0);
    expect(wrapper.find(Input)).to.have.length(0);
  });
  
  it('should show the preview and the delete checkbox if preview is provided', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} preview={preview} {...IntlData} />);
    expect(wrapper.find('img')).to.have.length(1);
    expect(wrapper.find(Input)).to.have.length(1);
  });

  it('should show the provided id', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} id={id} {...IntlData} />);
    expect(wrapper.find('Row').prop('id')).to.equal(id);
  });

  it('should show the provided classes', () => {
    const wrapper = shallow(<ImageUpload valueLink={valueLink} className={className} {...IntlData} />);
    expect(wrapper.find('Row').prop('className')).to.equal('image-uploader ' + className);
  });
});
