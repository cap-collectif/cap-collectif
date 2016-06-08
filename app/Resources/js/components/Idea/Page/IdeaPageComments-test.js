/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeaPageComments from './IdeaPageComments';
import CommentSection from '../../Comment/CommentSection';

const props = {
  id: 1,
};

describe('<IdeaPageComments />', () => {
  it('it should render a comment section in a div', () => {
    const wrapper = shallow(<IdeaPageComments {...props} {...IntlData} />);
    expect(wrapper.find('div.idea__comments')).to.have.length(1);
    const comments = wrapper.find(CommentSection);
    expect(comments).to.have.length(1);
    expect(comments.prop('uri')).to.equals('ideas');
    expect(comments.prop('object')).to.equals(props.id);
  });

  it('it should a div with provided class name', () => {
    const wrapper = shallow(<IdeaPageComments {...props} className="css-class" {...IntlData} />);
    expect(wrapper.find('div.idea__comments.css-class')).to.have.length(1);
  });
});
