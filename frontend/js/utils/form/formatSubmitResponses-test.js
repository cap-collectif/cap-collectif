// @flow
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import { allTypeQuestions, allTypeResponses } from './mocks';

const result = [
  {
    question: 'UXVlc3Rpb246NDg3',
    value: 'Paris',
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
    value: '10',
  },
  {
    medias: ['3de332be-6d0a-11ea-9d72-0242ac110006'],
    question: 'UXVlc3Rpb246NTAx',
  },
  {
    question: 'UXVlc3Rpb246NTAy',
    value: '{"labels":["Je suis vert"],"other":null}',
  },
  {
    question: 'UXVlc3Rpb246NTAz',
    value: '{"labels":["Dark Vador"],"other":null}',
  },
  {
    question: 'UXVlc3Rpb246NTA0',
    value: '{"labels":["Tennis","Football"],"other":null}',
  },
  {
    question: 'UXVlc3Rpb246NTA1',
    value: '{"labels":["Pomme","Poire","Fraise"],"other":null}',
  },
  {
    question: 'UXVlc3Rpb246NTA2',
    value: '2',
  },
];

describe('formatSubmitResponses', () => {
  it('should work without responses', () => {
    const formattedSubmitResponses = formatSubmitResponses([], allTypeQuestions);
    expect(formattedSubmitResponses).toEqual([]);
  });

  it('should format correctly', () => {
    const formattedSubmitResponses = formatSubmitResponses(allTypeResponses, allTypeQuestions);
    expect(formattedSubmitResponses).toEqual(result);
  });
});
