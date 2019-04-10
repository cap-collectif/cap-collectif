// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock } from '../../../mocks';
import ModalRegistrationFormQuestions from './ModalRegistrationFormQuestions';

describe('<ModalRegistrationFormQuestions/>', () => {
  const props = {
    change: jest.fn(),
    intl: intlMock,
    ...formMock,
    form: 'registration-form',
    responses: [],
    questions: [
      {
        type: 'text',
        required: true,
        private: false,
        question: 'Champ pas facultatif',
        slug: 'champ-pas-facultatif',
        id: 6,
      },
    ],
  };

  it('renders a form with dynamic fields', () => {
    const wrapper = shallow(<ModalRegistrationFormQuestions {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
