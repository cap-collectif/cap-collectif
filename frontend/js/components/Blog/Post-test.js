// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Post } from './Post';
import { $refType } from '../../mocks';

describe('<Post />', () => {
  const props = {
    features: { profiles: true },
  };

  const post = {
    $refType,
    title: 'title',
    publishedAt: '2017-09-20T08:21:25.854Z',
    createdAt: '2017-09-20T08:21:25.854Z',
    media: {
      url:
        'https://www.google.fr/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwigzMDxqLPWAhXLVxoKHZ-rAUsQjRwIBw&url=https%3A%2F%2Fcap-collectif.com%2F&psig=AFQjCNGj5wO9iFHHNqsdr61VAbCYQaAslw&ust=1505981622786991',
    },
    abstract: 'azazazaz',
    authors: [{ id: 'author1', vip: true, url: '', displayName: '' }],
    themes: [{ url: '', title: '' }],
    url: '',
  };

  it('should render a post', () => {
    const wrapper = shallow(<Post {...props} post={post} />);
    expect(wrapper.find('li').props()).toMatchObject({
      className: 'media media--news block block--bordered box',
    });

    expect(wrapper).toMatchSnapshot();
  });
});
