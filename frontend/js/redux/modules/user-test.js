// @flow
/* eslint-env jest */
import { reducer, cancelEmailChangeSucceed, userRequestEmailChange } from './user';
import type { State } from './user';

const initialState: State = {
  showLoginModal: false,
  showRegistrationModal: false,
  showLocaleHeader: true,
  registration_form: {
    hasQuestions: false,
    bottomTextDisplayed: false,
    topTextDisplayed: false,
    bottomText: '',
    topText: '',
    questions: [],
    domains: [],
  },
  user: null,
  displayChartModal: false,
  groupAdminUsersUserDeletionSuccessful: false,
  groupAdminUsersUserDeletionFailed: false,
};

describe('User Reducer', () => {
  it('Should handle CANCEL_EMAIL_CHANGE', () => {
    const state = {
      ...initialState,
      user: {
        ...initialState.user,
        newEmailToConfirm: 'new-email@gmail.com',
      },
    };
    // $FlowFixMe Redux is untyped
    const newState = reducer(state, cancelEmailChangeSucceed());
    expect(newState).toMatchSnapshot();
  });
  it('Should handle USER_REQUEST_EMAIL_CHANGE', () => {
    const newState = reducer(initialState, userRequestEmailChange('popo@gmail.com'));
    expect(newState).toMatchSnapshot();
  });
});
