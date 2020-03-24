// @flow
import formatResponses from '~/utils/form/formatResponses';
import { allTypeQuestions, allTypeResponses } from '~/utils/form/test/mocks';

const result = [
  {
    idQuestion: 'UXVlc3Rpb246NDg3',
    otherValue: null,
    required: false,
    type: 'select',
    validationRule: null,
    value: 'Paris',
  },
  {
    idQuestion: 'UXVlc3Rpb246NDk4',
    otherValue: null,
    required: false,
    type: 'text',
    value: 'Bien',
  },
  {
    idQuestion: 'UXVlc3Rpb246NDk3',
    otherValue: null,
    required: false,
    type: 'textarea',
    value: 'Blanc',
  },
  {
    idQuestion: 'UXVlc3Rpb246NTAw',
    otherValue: null,
    required: false,
    type: 'editor',
    value: '<p>Louveteau</p>',
  },
  {
    idQuestion: 'UXVlc3Rpb246NDk5',
    otherValue: null,
    required: false,
    type: 'number',
    value: '10',
  },
  {
    idQuestion: 'UXVlc3Rpb246NTAx',
    otherValue: null,
    required: false,
    type: 'medias',
    value: [
      {
        id: '3de332be-6d0a-11ea-9d72-0242ac110006',
        name: 'randomImage.jpg',
        size: '17.5 Ko',
        url:
          'https://demo.cap-collectif.com/media/default/0001/01/40dacc5a6c1bbf642d7b41728632cfa3d50f0edb.jpeg',
      },
    ],
  },
  {
    idQuestion: 'UXVlc3Rpb246NTAy',
    otherValue: null,
    required: false,
    type: 'button',
    validationRule: null,
    value: 'Je suis vert',
  },
  {
    idQuestion: 'UXVlc3Rpb246NTAz',
    otherValue: null,
    required: false,
    type: 'radio',
    validationRule: null,
    value: ['Dark Vador'],
  },
  {
    idQuestion: 'UXVlc3Rpb246NTA0',
    otherValue: null,
    required: false,
    type: 'checkbox',
    validationRule: null,
    value: ['Tennis', 'Football'],
  },
  {
    idQuestion: 'UXVlc3Rpb246NTA1',
    otherValue: null,
    required: false,
    type: 'ranking',
    validationRule: null,
    value: ['Pomme', 'Poire', 'Fraise'],
  },
];

describe('formatResponses', () => {
  it('should format correctly', () => {
    const formattedResponses = formatResponses(allTypeQuestions, allTypeResponses);
    expect(formattedResponses).toEqual(result);
  });
});
