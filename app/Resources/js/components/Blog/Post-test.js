/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Post } from './Post';
import IntlData from '../../translations/FR';

describe('<Post />', () => {
  const props = {
    ...IntlData,
    features: { profiles: true },
  };

  const post = {
    title: 'title',
    media: { url: '' },
    abstract: 'azazazaz',
    authors: [{ _links: { profile: '' }, displayName: '' }],
    themes: [{ _links: { show: '' }, title: '' }],
    _links: {
      show: '',
    },
  };

  it('should render a post', () => {
    const wrapper = shallow(<Post {...props} post={post} />);
    expect(wrapper.find('li').props()).toMatchObject({
      className: 'media media--news block block--bordered box',
    });

    expect(wrapper.find('.media--news__text').text()).toEqual(post.abstract);
  });
});
