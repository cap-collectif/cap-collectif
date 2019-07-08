// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalResponse } from './ProposalResponse';
import { $refType } from '../../../mocks';

describe('<ProposalResponse />', () => {
  it('should render a section response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'SectionQuestion',
          id: 'question1',
          title: 'Section',
          type: 'section',
          description: 'Je suis une section',
          helpText: '',
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 1,
          private: false,
          required: false,
        },
        value: null,
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a radio response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'MultipleChoiceQuestion',
          id: 'UXVlc3Rpb246OTA=',
          title: "Cet objet nécessite de l'entretien ?",
          type: 'radio',
          choices: [
            {
              id: 'fd432e8c-5a32-11e9-8813-0242ac110004',
              title: 'Oui mais trois fois rien',
              description: null,
              color: null,
              image: null,
            },
            {
              id: 'fd43333b-5a32-11e9-8813-0242ac110004',
              title: 'Oui quand même',
              description: null,
              color: null,
              image: null,
            },
            {
              id: 'fd4336ec-5a32-11e9-8813-0242ac110004',
              title: 'Non',
              description: null,
              color: null,
              image: null,
            },
          ],
          description: null,
          helpText: null,
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 1,
          randomQuestionChoices: false,
          validationRule: null,
          private: false,
          required: false,
        },
        value: '{"labels":["Non"],"other":null}',
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a null button response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'MultipleChoiceQuestion',
          id: 'UXVlc3Rpb246MzY0',
          title: "Cet objet nécessite de l'entretien ?",
          type: 'button',
          choices: [
            {
              id: 'fd432e8c-5a32-11e9-8813-0242ac110004',
              title: 'Oui mais trois fois rien',
              description: null,
              color: null,
              image: null,
            },
            {
              id: 'fd43333b-5a32-11e9-8813-0242ac110004',
              title: 'Oui quand même',
              description: null,
              color: null,
              image: null,
            },
            {
              id: 'fd4336ec-5a32-11e9-8813-0242ac110004',
              title: 'Non',
              description: null,
              color: null,
              image: null,
            },
          ],
          description: null,
          helpText: null,
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 317,
          randomQuestionChoices: false,
          validationRule: null,
          private: false,
          required: false,
        },
        value: '{"labels":[null],"other":null}',
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a not valid JSON radio response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'MultipleChoiceQuestion',
          id: 'question1',
          title: "Etes vous ok et dispo pour l'entretenir vous même ?",
          type: 'radio',
          description: null,
          helpText: null,
          choices: [
            {
              id: '4d684248-5a33-11e9-8813-0242ac110004',
              title: 'Affirmatif',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '4d6846ed-5a33-11e9-8813-0242ac110004',
              title: 'Oui mais pas tout seul',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '4d684a8a-5a33-11e9-8813-0242ac110004',
              title: 'Non déso',
              description: null,
              color: null,
              image: null,
            },
          ],
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 1,
          private: false,
          required: false,
          validationRule: null,
          randomQuestionChoices: false,
        },
        value: 'null', // Not valid JSON
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a number response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'SimpleQuestion',
          id: 'UXVlc3Rpb246ODk=',
          title: 'Coût (estimation)',
          type: 'number',
          description: null,
          helpText: null,
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 1,
          private: false,
          required: false,
        },
        value: '300',
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a text response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'SimpleQuestion',
          id: 'UXVlc3Rpb246ODg=',
          title: 'Référence',
          type: 'text',
          description: null,
          helpText: 'en ligne ou catalogue',
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          position: 1,
          private: false,
          required: false,
        },
        value: 'Leroy merlin lisa \n test',
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a select response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'MultipleChoiceQuestion',
          id: 'UXVlc3Rpb246NzU=',
          title: 'Zone de la terrasse concernée',
          choices: [
            {
              id: '39ada6de-5a31-11e9-8813-0242ac110004',
              title: 'Mur (le grand)',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '39adabfe-5a31-11e9-8813-0242ac110004',
              title: 'Entrée de la terrasse',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '39adb0cf-5a31-11e9-8813-0242ac110004',
              title: 'Milieu de la terrasse',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '39adb5bd-5a31-11e9-8813-0242ac110004',
              title: 'Bout de la terrasse',
              description: null,
              color: null,
              image: null,
            },
            {
              id: '39adbab6-5a31-11e9-8813-0242ac110004',
              title: 'Partout / peu importe',
              description: null,
              color: null,
              image: null,
            },
          ],
          type: 'select',
          description: null,
          helpText: null,
          alwaysJumpDestinationQuestion: null,
          jumps: [],
          number: 1,
          isOtherAllowed: false,
          randomQuestionChoices: false,
          position: 1,
          private: false,
          required: false,
          validationRule: null,
        },
        value: 'Mur (le grand)',
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a null media response', () => {
    const props = {
      response: {
        $refType,
        question: {
          __typename: 'MediaQuestion',
          id: 'UXVlc3Rpb246MzY1',
          title:
            'Vous souhaitez partager le compte rendu des \u00e9changes ou tout autre document ?',
          number: 1,
          private: false,
          position: 313,
          alwaysJumpDestinationQuestion: null,
          required: false,
          helpText: 'Les formats vid\u00e9os ne sont pas accept\u00e9s.',
          jumps: [],
          description: '',
          type: 'medias',
        },
        medias: [],
      },
    };
    const wrapper = shallow(<ProposalResponse {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
