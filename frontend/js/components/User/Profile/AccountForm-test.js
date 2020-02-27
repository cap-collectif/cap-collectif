// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { AccountForm } from './AccountForm';
import { features } from '~/redux/modules/default';
import {intlMock, formMock, $refType, $fragmentRefs} from '~/mocks';

describe('<AccountForm />', () => {
  const props = {
    ...formMock,
    currentLanguage: 'fr-FR',
    defaultLocale: 'en-GB',
    features,
    languageList: [{ translationKey: 'french', code: 'fr-FR' }, { translationKey: 'english', code: 'en-GB' }],
    intl: intlMock,
    dispatch: jest.fn(),
    handleSubmit: jest.fn(),
    viewer: {
      $refType,
      $fragmentRefs,
      locale: 'fr-FR',
    },
    initialValues: { email: 'initial-email@gmail.fr' },
  };

  it('should render a form', () => {
    const wrapper = shallow(<AccountForm {...props} confirmationEmailResent={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with an alert if submitted password is wrong', () => {
    const wrapper = shallow(
      <AccountForm
        {...props}
        confirmationEmailResent={false}
        error="user.confirm.wrong_password"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with information about new email', () => {
    const wrapper = shallow(
      <AccountForm
        {...props}
        confirmationEmailResent={false}
        newEmailToConfirm="new-email@test.com"
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a form with an info if a confirmation email has been resent', () => {
    const wrapper = shallow(
      <AccountForm {...props} confirmationEmailResent newEmailToConfirm="new-email@test.com" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
