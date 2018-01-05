// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageEvaluation } from './ProposalPageEvaluation';
import { formMock } from '../../../mocks';

describe('<ProposalPageEvaluation />', () => {
  const proposal = {
    id: 'proposal1',
    viewerIsAnEvaluer: true,
    form: {
      evaluationForm: {
        questions: [
          {
            id: 'question1',
            title: 'Question 1',
            position: 0,
            private: false,
            required: true,
            helpText: null,
            type: 'text',
            isOtherAllowed: false,
            validationRule: null,
            choices: [],
          },
        ],
      },
    },
    evaluation: {
      version: 1,
      responses: [
        {
          question: { id: 'question1' },
          value: 'Paul',
        },
      ],
    },
  };

  const props = {
    ...formMock,
    proposal,
    intl: global.intlMock,
    responses: [],
  };

  it('render a form if viewer is an evaluer', () => {
    const wrapper = shallow(<ProposalPageEvaluation {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsDisabled = {
    proposal: { ...proposal, viewerIsAnEvaluer: false },
    ...formMock,
    intl: global.intlMock,
    responses: [],
  };

  it('render a disabled form if viewer is not an evaluer', () => {
    const wrapper = shallow(<ProposalPageEvaluation {...propsDisabled} />);
    expect(wrapper).toMatchSnapshot();
  });
});
