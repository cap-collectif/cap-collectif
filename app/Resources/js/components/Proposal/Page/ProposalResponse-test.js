/* eslint-env jest */
// @flow
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

  it('should render correct with empty answer', () => {
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
