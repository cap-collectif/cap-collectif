/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProposalPageAnswer from './ProposalPageAnswer';

describe('<ProposalPageAnswer />', () => {
  const answer = {
    author: {
      vip: false,
    },
  };

  const answerWithTitle = {
    author: {
      vip: false,
    },
    title: 'Titre',
  };

  const answerWithVipAuthor = {
    author: {
      vip: true,
    },
  };

  it('should not render anything if answer is not provided', () => {
    const wrapper = shallow(<ProposalPageAnswer />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should render a proposal answer', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answer} />);
    const div = wrapper.find('div');
    expect(div).toHaveLength(1);
    expect(div.prop('className')).toEqual('block ');
    const title = div.find('h2');
    expect(title).toHaveLength(0);
    const body = div.find('AnswerBody');
    expect(body).toHaveLength(1);
    expect(body.prop('answer')).toEqual(answer);
  });

  it('should render a h2 when provided answer has title', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answerWithTitle} />);
    const div = wrapper.find('div');
    const title = div.find('h2');
    expect(title).toHaveLength(1);
    expect(title.prop('className')).toEqual('h2');
    expect(title.text()).toEqual(answerWithTitle.title);
  });

  it('should render a div with vip background when answer\'s author is vip', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answerWithVipAuthor} />);
    const div = wrapper.find('div');
    expect(div.prop('className')).toEqual('bg-vip block ');
  });

  it('should render a div with specified classes', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answer} className="css-class" />);
    const div = wrapper.find('div');
    expect(div.prop('className')).toEqual('block css-class');
  });
});
