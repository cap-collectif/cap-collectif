/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { QuestionnaireAdminResultsPieChart } from './QuestionnaireAdminResultsPieChart'
import { intlMock, $refType } from '../../mocks'

describe('<QuestionnaireAdminResultsPieChart />', () => {
  const otherAllowed = {
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
              title: 'choix1',
              responses: {
                totalCount: 5,
              },
            },
          },
          {
            node: {
              title: 'choix2',
              responses: {
                totalCount: 25,
              },
            },
          },
          {
            node: {
              title: 'choix3',
              responses: {
                totalCount: 2,
              },
            },
          },
          {
            node: {
              title: 'choix4',
              responses: {
                totalCount: 250,
              },
            },
          },
          {
            node: {
              title: 'choix5',
              responses: {
                totalCount: 76,
              },
            },
          },
          {
            node: {
              title: 'choix6',
              responses: {
                totalCount: 77,
              },
            },
          },
        ],
      },
    },
  }
  const otherNotAllowed = {
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
  it('renders correctly with other responses', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPieChart {...otherAllowed} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly without other responses & on mobile', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPieChart {...otherNotAllowed} />)
    expect(wrapper).toMatchSnapshot()
  })
})
