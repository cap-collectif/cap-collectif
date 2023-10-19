import formatResponses from '~/utils/form/formatResponses'
import formatQuestions from '~/utils/form/formatQuestions'
import { allTypeQuestions, allTypeResponses } from './mocks'

const result = [
  {
    id: 'UXVlc3Rpb246NDg3',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Capital de la France ?',
  },
  {
    id: 'UXVlc3Rpb246NDk4',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Comment tu vas ?',
  },
  {
    id: 'UXVlc3Rpb246NDk3',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: "De quelle couleur est le cheval blanc d'Henry IV ?",
  },
  {
    id: 'UXVlc3Rpb246NTAw',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Petit du loup ?',
  },
  {
    id: 'UXVlc3Rpb246NDk5',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: "Combien j'ai de doigt ?",
  },
  {
    id: 'UXVlc3Rpb246NTAx',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Envoie ton CV',
  },
  {
    id: 'UXVlc3Rpb246NTAy',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Coche la case vert',
  },
  {
    id: 'UXVlc3Rpb246NTAz',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Qui a dit "Je suis ton père" ?',
  },
  {
    id: 'UXVlc3Rpb246NTA0',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Tes sports préférés ?',
  },
  {
    id: 'UXVlc3Rpb246NTA1',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Fruits préférés ?',
  },
  {
    id: 'UXVlc3Rpb246NTA2',
    questionsNotDisplay: [],
    questionsToDisplay: [],
    title: 'Comment vas-tu ?',
  },
]
describe('formatQuestions', () => {
  const formattedResponses = formatResponses(allTypeQuestions, allTypeResponses)
  it('should format correctly', () => {
    const formattedQuestions = formatQuestions(allTypeQuestions, formattedResponses)
    expect(formattedQuestions).toEqual(result)
  })
})
