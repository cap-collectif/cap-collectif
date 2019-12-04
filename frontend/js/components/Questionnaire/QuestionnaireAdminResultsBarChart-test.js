// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsBarChart } from './QuestionnaireAdminResultsBarChart';
import { $refType, intlMock } from '../../mocks';

describe('<QuestionnaireAdminResultsBarChart />', () => {
  const otherAllowed = {
    backgroundColor: '#128085',
    intl: intlMock,
    multipleChoiceQuestion: {
      $refType,
      isOtherAllowed: true,
      otherResponses: { totalCount: 6 },
      choices: [
        { title: "C'est pas faux", responses: { totalCount: 97 } },
        { title: "C'est vrai", responses: { totalCount: 0 } },
        { title: 'Oui', responses: { totalCount: 7 } },
        { title: 'Non', responses: { totalCount: 25 } },
      ],
    },
  };

  const otherNotAllowed = {
    backgroundColor: '#128085',
    intl: intlMock,
    multipleChoiceQuestion: {
      $refType,
      isOtherAllowed: false,
      otherResponses: { totalCount: 0 },
      choices: [
        { title: "C'est pas faux", responses: { totalCount: 76 } },
        { title: 'Oui', responses: { totalCount: 3 } },
        { title: 'Non', responses: { totalCount: 1 } },
      ],
    },
  };

  it('renders correctly with other responses & empty response', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsBarChart {...otherAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without other responses & on mobile', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsBarChart {...otherNotAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
