// @flow
/* eslint-env jest */
import * as React from 'react';
import { RelayEnvironmentProvider } from 'relay-hooks';
import { shallow } from 'enzyme';
import { QuestionnaireReplyPage } from './QuestionnaireReplyPage';
import { $fragmentRefs, $refType } from '~/mocks';
import environment from '~/createRelayEnvironment';

const baseProps = {
  isAuthenticated: true,
  dataPrefetch: {
    dispose: jest.fn(),
    getValue: jest.fn(),
    next: jest.fn(),
    subscribe: jest.fn(),
  },
  match: {
    params: {
      id: 'reply123',
    },
    isExact: false,
    path: 'https://questionnaire/replies/reply123',
    url: 'https://questionnaire/replies/reply123',
  },
  submitReplyForm: jest.fn(),
  resetReplyForm: jest.fn(),
  questionnaire: {
    step: {
      $fragmentRefs,
    },
    viewerReplies: {
      totalCount: 2,
      edges: [
        {
          node: {
            id: '1',
          },
        },
        {
          node: {
            id: '2',
          },
        },
      ],
    },
    $refType,
  },
};

const props = {
  basic: baseProps,
  notAuthenticated: {
    ...baseProps,
    isAuthenticated: false,
  },
  notPreloaded: {
    ...baseProps,
    dataPrefetch: null,
  },
};

describe('<QuestionnaireReplyPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <RelayEnvironmentProvider environment={environment}>
        <QuestionnaireReplyPage {...props.basic} />,
      </RelayEnvironmentProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when not authenticated', () => {
    const wrapper = shallow(
      <RelayEnvironmentProvider environment={environment}>
        <QuestionnaireReplyPage {...props.notAuthenticated} />
      </RelayEnvironmentProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when data not preloaded', () => {
    const wrapper = shallow(
      <RelayEnvironmentProvider environment={environment}>
        <QuestionnaireReplyPage {...props.notPreloaded} />
      </RelayEnvironmentProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
