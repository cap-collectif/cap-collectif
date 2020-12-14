/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RelayEnvironmentProvider } from 'relay-hooks';
import ProjectAdminContributionsPage from './ProjectAdminContributionsPage';
import environment from '~/createRelayEnvironment';

const baseProps = {
  dataPrefetch: {
    dispose: jest.fn(),
    getValue: jest.fn(),
    next: jest.fn(),
    subscribe: jest.fn(),
  },
  projectId: 'project123',
};

const props = {
  basic: baseProps,
};

describe('<ProjectAdminContributionsPage />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectAdminContributionsPage {...props.basic} />
      </RelayEnvironmentProvider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
