// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { MultipleChoiceRadio } from './MultipleChoiceRadio';

describe('<MultipleChoiceRadio />', () => {
  const props = {
    name: 'responses[4]',
    choices: [
      {
        color: null,
        description: null,
        id: 'questionchoice26',
        label: 'Je dis oui',
      },
      {
        color: null,
        description: null,
        id: 'questionchoice27',
        label: 'Je dis non',
      },
      {
        color: null,
        description: null,
        id: 'questionchoice28',
        label: "J'ai rien compris",
      },
    ],
    helpText: 'Une seule réponse valable ici, faites le bon choix !',
    isOtherAllowed: true,
    value: {
      labels: null,
      other: 'Autre valeur',
    },
    change: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<MultipleChoiceRadio {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
