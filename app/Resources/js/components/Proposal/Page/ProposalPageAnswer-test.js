/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.children()).to.have.length(0);
  });

  it('should render a proposal answer', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answer} />);
    const div = wrapper.find('div');
    expect(div).to.have.length(1);
    expect(div.prop('className')).to.equal('block ');
    const title = div.find('h2');
    expect(title).to.have.length(0);
    const body = div.find('AnswerBody');
    expect(body).to.have.length(1);
    expect(body.prop('answer')).to.equal(answer);
  });

  it('should render a h2 when provided answer has title', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answerWithTitle} />);
    const div = wrapper.find('div');
    const title = div.find('h2');
    expect(title).to.have.length(1);
    expect(title.prop('className')).to.equal('h2');
    expect(title.text()).to.equal(answerWithTitle.title);
  });

  it('should render a div with vip background when answer\'s author is vip', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answerWithVipAuthor} />);
    const div = wrapper.find('div');
    expect(div.prop('className')).to.equal('bg-vip block ');
  });

  it('should render a div with specified classes', () => {
    const wrapper = shallow(<ProposalPageAnswer answer={answer} className="css-class" />);
    const div = wrapper.find('div');
    expect(div.prop('className')).to.equal('block css-class');
  });
});
