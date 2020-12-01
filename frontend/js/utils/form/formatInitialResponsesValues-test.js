// @flow
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import { allTypeQuestions } from './mocks';

const responses = [
  {
    question: {
      id: 'UXVlc3Rpb246NDg3',
    },
    value: 'Paris',
  },
  {
    question: {
      id: 'UXVlc3Rpb246NDk4',
    },
    value: 'Bien',
  },
  {
    question: {
      id: 'UXVlc3Rpb246NDk3',
    },
    value: 'Blanc',
  },
  {
    question: {
      id: 'UXVlc3Rpb246NTAw',
    },
    value: '<p>Louveteau</p>',
  },
  {
    question: {
      id: 'UXVlc3Rpb246NDk5',
    },
    value: '10',
  },
  {
    question: {
      id: 'UXVlc3Rpb246NTAx',
    },
    medias: [
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
    question: {
      id: 'UXVlc3Rpb246NTAy',
    },
    value: JSON.stringify({ labels: ['Je suis vert'], other: null }),
  },
  {
    question: {
      id: 'UXVlc3Rpb246NTAz',
    },
    value: JSON.stringify({ labels: ['Dark Vador'], other: null }),
  },
  {
    question: {
      id: 'UXVlc3Rpb246NTA0',
    },
    value: JSON.stringify({ labels: ['Tennis', 'Football'], other: null }),
  },
  {
    question: { id: 'UXVlc3Rpb246NTA1' },
    value: JSON.stringify({ labels: ['Pomme', 'Poire'], other: null }),
  },
  {
    question: { id: 'UXVlc3Rpb246NTA2' },
    value: '2',
  },
];

const resultWithResponse = [
  {
    question: 'UXVlc3Rpb246NDg3',
    value: {
      label: 'Paris',
      value: 'Paris',
    },
  },
  {
    question: 'UXVlc3Rpb246NDk4',
    value: 'Bien',
  },
  {
    question: 'UXVlc3Rpb246NDk3',
    value: 'Blanc',
  },
  {
    question: 'UXVlc3Rpb246NTAw',
    value: '<p>Louveteau</p>',
  },
  {
    question: 'UXVlc3Rpb246NDk5',
    value: 10,
  },
  {
    question: 'UXVlc3Rpb246NTAx',
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
    question: 'UXVlc3Rpb246NTAy',
    value: 'Je suis vert',
  },
  {
    question: 'UXVlc3Rpb246NTAz',
    value: {
      labels: ['Dark Vador'],
      other: null,
    },
  },
  {
    question: 'UXVlc3Rpb246NTA0',
    value: {
      labels: ['Tennis', 'Football'],
      other: null,
    },
  },
  {
    question: 'UXVlc3Rpb246NTA1',
    value: ['Pomme', 'Poire'],
  },
  {
    question: 'UXVlc3Rpb246NTA2',
    value: '2',
  },
];

const resultWithoutResponse = [
  {
    question: 'UXVlc3Rpb246NDg3',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NDk4',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NDk3',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NTAw',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NDk5',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NTAx',
    value: [],
  },
  {
    question: 'UXVlc3Rpb246NTAy',
    value: null,
  },
  {
    question: 'UXVlc3Rpb246NTAz',
    value: {
      labels: [],
      other: null,
    },
  },
  {
    question: 'UXVlc3Rpb246NTA0',
    value: {
      labels: [],
      other: null,
    },
  },
  {
    question: 'UXVlc3Rpb246NTA1',
    value: [],
  },
  {
    question: 'UXVlc3Rpb246NTA2',
    value: null,
  },
];

describe('formatInitialResponsesValues', () => {
  it('should format correctly', () => {
    const responsesFormatted = formatInitialResponsesValues(allTypeQuestions, responses);
    expect(responsesFormatted).toEqual(resultWithResponse);
  });

  it('should format correctly when no response', () => {
    const responsesFormatted = formatInitialResponsesValues(allTypeQuestions, []);
    expect(responsesFormatted).toEqual(resultWithoutResponse);
  });
});
