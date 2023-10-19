/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { QuestionnaireAdminResultsBarChart } from './QuestionnaireAdminResultsBarChart'
import { $refType, intlMock } from '../../mocks'

describe('<QuestionnaireAdminResultsBarChart />', () => {
  const otherAllowed = {
    backgroundColor: '#128085',
    intl: intlMock,
    innerRef: jest.fn(),
    multipleChoiceQuestion: {
      ' $refType': $refType,
      isOtherAllowed: true,
      otherResponses: {
        totalCount: 6,
      },
      choices: {
        edges: [
          {
            node: {
              title: "C'est pas faux",
              responses: {
                totalCount: 97,
              },
            },
          },
          {
            node: {
              title: "C'est vrai",
              responses: {
                totalCount: 0,
              },
            },
          },
          {
            node: {
              title: 'Oui',
              responses: {
                totalCount: 7,
              },
            },
          },
          {
            node: {
              title: 'Non',
              responses: {
                totalCount: 25,
              },
            },
          },
        ],
      },
    },
  }
  const otherNotAllowed = {
    backgroundColor: '#128085',
    intl: intlMock,
    innerRef: jest.fn(),
    multipleChoiceQuestion: {
      ' $refType': $refType,
      isOtherAllowed: false,
      otherResponses: {
        totalCount: 0,
      },
      choices: {
        edges: [
          {
            node: {
              title: "C'est pas faux",
              responses: {
                totalCount: 76,
              },
            },
          },
          {
            node: {
              title: 'Oui',
              responses: {
                totalCount: 3,
              },
            },
          },
          {
            node: {
              title: 'Non',
              responses: {
                totalCount: 1,
              },
            },
          },
        ],
      },
    },
  }
  it('renders correctly with other responses & empty response', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsBarChart {...otherAllowed} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly without other responses & on mobile', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsBarChart {...otherNotAllowed} />)
    expect(wrapper).toMatchSnapshot()
  })
})
