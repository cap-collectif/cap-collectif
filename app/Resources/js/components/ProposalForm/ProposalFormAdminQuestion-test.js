// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminQuestion } from './ProposalFormAdminQuestion';

describe('<ProposalFormAdminQuestion />', () => {
  const props = {
    question: {
      type: 'section',
      title: 'Section Title',
    },
    index: 1,
    provided: {
      placeholder: '',
    },
    handleClickEdit: jest.fn(),
    handleClickDelete: jest.fn(),
  };

  const propsQuestion = {
    ...props,
    question: {
      type: 'text',
      title: 'Question Title',
    },
  };

  const propsMedia = {
    ...propsQuestion,
    question: {
      type: 'medias',
      title: 'Question Title',
    },
  };

  const propsCheckbox = {
    ...propsQuestion,
    question: {
      type: 'checkbox',
      title: 'Question Title',
    },
  };

  it('render correctly a section', () => {
    const wrapper = shallow(<ProposalFormAdminQuestion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a text question', () => {
    const wrapper = shallow(<ProposalFormAdminQuestion {...propsQuestion} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a medias question', () => {
    const wrapper = shallow(<ProposalFormAdminQuestion {...propsMedia} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly a checkbox question', () => {
    const wrapper = shallow(<ProposalFormAdminQuestion {...propsCheckbox} />);
    expect(wrapper).toMatchSnapshot();
  });
});
