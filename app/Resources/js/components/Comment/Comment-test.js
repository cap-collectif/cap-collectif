// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Comment } from './Comment';
import { $refType, $fragmentRefs } from '../../mocks';

const props = {
  comment: {
    $refType,
    $fragmentRefs,
    author: {
      displayName: 'admin',
      media: null,
      vip: true,
    },
    id: 'proposalComment1',
  },
};

describe('<Comment />', () => {
  it('should render correctly highlighted', () => {
    const comment = {
      id: 'comment1',
      author: {
        vip: true,
        displayName: 'jcVandam',
        media: {
          url: 'http://perdu.com/image.jpg',
        },
      },
      $fragmentRefs,
      $refType,
    };
    const wrapper = shallow(<Comment comment={comment} isHighlighted />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly not highlighted', () => {
    const comment = {
      id: 'comment2',
      author: {
        vip: true,
        displayName: 'jcVandam',
        media: null,
      },
      $fragmentRefs,
      $refType,
    };
    const wrapper = shallow(<Comment comment={comment} isHighlighted={false} />);
    wrapper.setState({ answerFormShown: true });
    expect(wrapper).toMatchSnapshot();
  });

  describe('<Comment /> shown and focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />);
      wrapper.setState({
        answerFormShown: true,
        answerFormFocus: true,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('<Comment /> not shown and focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />);
      wrapper.setState({
        answerFormShown: false,
        answerFormFocus: true,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('<Comment /> shown and not focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />);
      wrapper.setState({
        answerFormShown: true,
        answerFormFocus: false,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
  describe('<Comment /> not shown and not focus', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<Comment {...props} />);
      wrapper.setState({
        answerFormShown: false,
        answerFormFocus: false,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
