import * as React from 'react'
import { shallow } from 'enzyme'
import QuestionnaireAdminResultsPdfModal from './QuestionnaireAdminResultsPdfModal'
import { $refType } from '../../mocks'

export const questionnaire = {
  exportResultsUrl: 'https://capco.dev/questionnaires/questionnaire1/download?_locale=fr-FR',
  title: 'Votre avis sur les JO 2024 à Paris',
  anonymousAllowed: true,
  multipleRepliesAllowed: true,
  participants: {
    totalCount: 20,
  },
  step: {
    timeRange: {
      startAt: '2014-09-27 00:00:00',
      endAt: '2060-09-27 00:00:00',
      hasEnded: false,
      isTimeless: false,
    },
    url: 'https://capco.dev/project/projet-avec-questionnaire/questionnaire/questionnaire-des-jo-2024',
  },
  questions: [
    {
      __typename: 'SectionQuestion',
      id: 'UXVlc3Rpb246MzAx',
      title: 'Nouvelle section 1',
      type: 'section',
      required: false,
      private: false,
      participants: {
        totalCount: 0,
      },
      allResponses: {
        totalCount: 0,
      },
      level: 0,
    },
    {
      __typename: 'SimpleQuestion',
      id: 'UXVlc3Rpb246Mg==',
      title: "Êtes-vous satisfait que la ville de Paris soit candidate à l'organisation des JO de 2024 ?",
      type: 'text',
      required: true,
      private: false,
      participants: {
        totalCount: 3,
      },
      allResponses: {
        totalCount: 17,
      },
      tagCloud: [
        {
          value: 'sportifs',
          occurrencesCount: 7,
        },
        {
          value: 'va',
          occurrencesCount: 7,
        },
      ],
    },
    {
      __typename: 'SectionQuestion',
      id: 'UXVlc3Rpb246NDYxNg==',
      title: 'sous section 1',
      type: 'section',
      required: false,
      private: false,
      participants: {
        totalCount: 0,
      },
      allResponses: {
        totalCount: 0,
      },
      level: 1,
    },
    {
      __typename: 'MultipleChoiceQuestion',
      id: 'UXVlc3Rpb246MTY=',
      title: 'Classez vos choix',
      type: 'ranking',
      required: false,
      private: false,
      participants: {
        totalCount: 0,
      },
      allResponses: {
        totalCount: 0,
      },
    },
    {
      __typename: 'MajorityQuestion',
      id: 'UXVlc3Rpb246MTM4NQ==',
      title: 'Comment trouvez vous le jeu de weeb Genshin Impact ?',
      type: 'majority',
      required: false,
      private: false,
      participants: {
        totalCount: 16,
      },
      allResponses: {
        totalCount: 16,
      },
    },
  ],
  ' $refType': $refType,
}
export const chartsRef = [
  {
    id: 'abc',
    ref: null,
  },
  {
    id: 'def',
    ref: null,
  },
  {
    id: 'ijk',
    ref: null,
  },
]
describe('<QuestionnaireAdminResultsPdfModal />', () => {
  const props = {
    onClose: jest.fn(),
    show: true,
    questionnaire,
    logoUrl: '/logo',
    chartsRef,
  }
  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
