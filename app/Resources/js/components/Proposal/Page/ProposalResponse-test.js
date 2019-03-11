// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalResponse } from './ProposalResponse';
import { $refType } from '../../../mocks';

describe('<ProposalResponse />', () => {
  const props = {
    response: {
      $refType,
      question: {
        id: 'question1',
        title: 'Question invisible?',
        type: 'radio',
        description: 'On ne voit pas cette question',
        helpText: '',
        jumps: [],
        number: 1,
        position: 1,
        private: false,
        required: false,
      },
    },
    value: "{'labels':[],'other':null}",
  };

  const questionTypeNumber = {
    response: {
      $refType,
      question: {
        id: 'question1',
        title: 'Question type number ?',
        type: 'number',
        description: 'On ne voit pas cette question',
        helpText: '',
        jumps: [],
        number: 1,
        position: 1,
        private: false,
        required: false,
      },
    },
    value: '0608806996',
  };

  it('should render correct with empty answer', () => {
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correct with question type number', () => {
    const wrapper = shallow(<ProposalResponse {...questionTypeNumber} />);
    expect(wrapper).toMatchSnapshot();
  });
});
