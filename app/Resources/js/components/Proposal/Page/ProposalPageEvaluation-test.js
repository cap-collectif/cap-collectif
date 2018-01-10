// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageEvaluation } from './ProposalPageEvaluation';

describe('<ProposalPageEvaluation />', () => {
  const proposal = {
    id: 'proposal1',
    viewerIsAnEvaluer: true,
    responses: [],
    form: {
      evaluationForm: {
        questions: [
          {
            id: 'question1',
            title: 'Question 1',
            slug: 'slug-1',
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
      responses: [
        {
          question: { id: 'question1', type: 'text' },
          value: 'Paul',
        },
      ],
    },
  };

  const props = {
    proposal,
    ...global.formMock,
    intl: global.intlMock,
  };

  it('render a form if viewer is an evaluer', () => {
    const wrapper = shallow(<ProposalPageEvaluation {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  const propsDisabled = {
    proposal: { ...proposal, viewerIsAnEvaluer: false },
    ...global.formMock,
    intl: global.intlMock,
  };

  it('render a disabled form if viewer is not an evaluer', () => {
    const wrapper = shallow(<ProposalPageEvaluation {...propsDisabled} />);
    expect(wrapper).toMatchSnapshot();
  });
});
