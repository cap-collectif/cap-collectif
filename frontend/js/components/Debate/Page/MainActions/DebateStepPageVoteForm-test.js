// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import { reduxForm } from 'redux-form';
import * as hooks from '@xstate/react/lib/useActor';
import { DebateStepPageVoteForm } from './DebateStepPageVoteForm';
import { $refType, $fragmentRefs, formMock, intlMock } from '~/mocks';
import MockProviders, { addsSupportForPortals, clearSupportForPortals } from '~/testUtils';
import { MachineContext } from './DebateStepPageStateMachine';

describe('<DebateStepPageVoteForm/>', () => {
  const debate = {
    $fragmentRefs,
    id: 'debate1',
    $refType,
    url: '/debate',
  };

  const viewer = {
    id: 'viewer-123',
    username: 'Jean Castex',
    isEmailConfirmed: true,
  };

  const props = {
    ...formMock,
    intl: intlMock,
    body: 'Oui je suis pour',
    showArgumentForm: true,
    setShowArgumentForm: jest.fn(),
    viewerIsConfirmed: true,
    organizationName: 'CapCollectif',
    widgetLocation: null,
    viewer,
    send: jest.fn(),
    initialValues: {
      body: '',
    },
  };

  beforeEach(() => {
    addsSupportForPortals();
  });

  afterEach(() => {
    clearSupportForPortals();
  });

  const Machine = { value: {} };
  const DebateStepPageVoteFormDecorated = reduxForm({ form: 'testForm' })(DebateStepPageVoteForm);

  const renderComponent = (isMobile: boolean) => {
    const wrapper = render(
      <MockProviders store={{}}>
        <MachineContext.Provider value={{ ...Machine }}>
          <DebateStepPageVoteFormDecorated {...props} debate={debate} isMobile={isMobile} />
        </MachineContext.Provider>
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  };

  it('should renders correctly when voted', () => {
    jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'voted' }, jest.fn()]);
    renderComponent(false);
  });
  it('should renders correctly when voted on mobile', () => {
    jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'voted' }, jest.fn()]);
    renderComponent(true);
  });
  it('should renders correctly when argumented', () => {
    jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'argumented' }, jest.fn()]);
    renderComponent(false);
  });
  it('should renders correctly when argumented on mobile', () => {
    jest.spyOn(hooks, 'useActor').mockImplementation(() => [{ value: 'argumented' }, jest.fn()]);
    renderComponent(true);
  });
  it('should renders correctly when voted anonymously', () => {
    jest
      .spyOn(hooks, 'useActor')
      .mockImplementation(() => [{ value: 'voted_anonymous' }, jest.fn()]);
    renderComponent(false);
  });
  it('should renders correctly when voted anonymously on mobile', () => {
    jest
      .spyOn(hooks, 'useActor')
      .mockImplementation(() => [{ value: 'voted_anonymous' }, jest.fn()]);
    renderComponent(true);
  });
  it('should renders correctly when argumented not confirmed', () => {
    jest
      .spyOn(hooks, 'useActor')
      .mockImplementation(() => [{ value: 'argumented_not_confirmed' }, jest.fn()]);
    renderComponent(false);
  });
  it('should renders correctly when argumented not confirmed on mobile', () => {
    jest
      .spyOn(hooks, 'useActor')
      .mockImplementation(() => [{ value: 'argumented_not_confirmed' }, jest.fn()]);
    renderComponent(true);
  });
});
