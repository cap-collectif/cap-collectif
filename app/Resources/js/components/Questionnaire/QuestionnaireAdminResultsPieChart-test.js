// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsPieChart } from './QuestionnaireAdminResultsPieChart';
import { intlMock } from '../../mocks';

describe('<QuestionnaireAdminResultsPieChart />', () => {
  const otherAllowed = {
    intl: intlMock,
    multipleChoiceQuestion: {
      isOtherAllowed: true,
      otherResponses: { totalCount: 6 },
      questionChoices: [
        { title: "C'est pas faux", responses: { totalCount: 97 } },
        { title: "C'est vrai", responses: { totalCount: 0 } },
        { title: 'Oui', responses: { totalCount: 7 } },
        { title: 'Non', responses: { totalCount: 25 } },
      ],
    },
  };

  const otherNotAllowed = {
    intl: intlMock,
    multipleChoiceQuestion: {
      isOtherAllowed: false,
      otherResponses: { totalCount: 0 },
      questionChoices: [
        { title: "C'est pas faux", responses: { totalCount: 76 } },
        { title: 'Oui', responses: { totalCount: 3 } },
        { title: 'Non', responses: { totalCount: 1 } },
      ],
    },
  };

  it('renders correctly with other responses', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPieChart {...otherAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without other responses & on mobile', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPieChart {...otherNotAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });
});
