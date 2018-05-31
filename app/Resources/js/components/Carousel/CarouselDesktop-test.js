// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CarouselDesktop } from './CarouselDesktop';

describe('<CarouselDesktop />', () => {
  const props = {
    highlighteds: [
      {
        position: 1,
        id: 4,
        object_type: 'post',
        post: {
          title: 'Immobilier',
          publishedAt: '2018-04-09T23:21:06+0200',
          _links: {
            show: 'capco.test/post/immobilier',
          },
        },
      },
      {
        position: 2,
        id: 3,
        object_type: 'project',
        project: {
          title: 'Croissance, Innovation, Disruption',
          startAt: '2018-04-09T23:21:06+0200',
          _links: {
            show: 'capco.test/project/croissance',
          },
          cover: {
            url: '/media/croissance.jpg',
          },
        },
      },
      {
        position: 3,
        id: 2,
        object_type: 'event',
        event: {
          title: 'ParisWeb 2016',
          startAt: '2018-04-18T16:24:00+0200',
          endAt: '2018-05-12T12:10:00+0200',
          _links: {
            show: 'capco.test/event/parisweb2016',
          },
        },
      },
      {
        position: 4,
        id: 1,
        object_type: 'idea',
        idea: {
          title: 'My idea',
          createdAt: '2018-04-16T18:35:25+0200',
          _links: {
            show: 'capco.test/idea/myidea',
          },
        },
      },
    ],
  };

  const propsEmptyItem = {
    highlighteds: [
      {
        position: 1,
        id: 4,
        object_type: 'post',
        post: {
          title: 'Immobilier',
          publishedAt: '2018-04-09T23:21:06+0200',
          _links: {
            show: 'capco.test/post/immobilier',
          },
        },
      },
    ],
  };

  it('should render correctly', () => {
    const wrapper = shallow(<CarouselDesktop {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly emptyItem', () => {
    const wrapper = shallow(<CarouselDesktop {...propsEmptyItem} />);
    const emptyItem = wrapper.find('.empty-item');
    expect(emptyItem).toHaveLength(3);
  });
});
