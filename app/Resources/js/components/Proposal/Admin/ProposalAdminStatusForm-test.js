// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminStatusForm } from './ProposalAdminStatusForm';

describe('<ProposalAdminStatusForm />', () => {
  it('render correctly if published but user can soon expire', () => {
    const proposalToBeExpired = {
      id: '1',
      trashedReason: null,
      author: {
        id: 'author1',
        expiresAt: 'Soon',
        email: 'soon@yopmail.com',
      },
      deletedAt: null,
      publicationStatus: 'PUBLISHED',
    };
    const wrapper = shallow(
      <ProposalAdminStatusForm
        publicationStatus="PUBLISHED"
        isSuperAdmin
        isAuthor={false}
        pristine
        invalid={false}
        valid={false}
        submitSucceeded={false}
        submitFailed={false}
        submitting={false}
        relay={{}}
        dispatch={jest.fn()}
        proposal={proposalToBeExpired}
        handleSubmit={jest.fn()}
        intl={global.intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly if expired', () => {
    const proposalExpired = {
      id: '1',
      trashedReason: null,
      publicationStatus: 'EXPIRED',
      author: {
        id: 'author1',
        expiresAt: null,
        email: 'osef@yopmail.com',
      },
      deletedAt: null,
    };
    const wrapper = shallow(
      <ProposalAdminStatusForm
        publicationStatus="EXPIRED"
        relay={{}}
        isSuperAdmin
        isAuthor={false}
        pristine
        invalid={false}
        valid={false}
        submitSucceeded={false}
        submitFailed={false}
        submitting={false}
        dispatch={jest.fn()}
        proposal={proposalExpired}
        handleSubmit={jest.fn()}
        intl={global.intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly if published and user is confirmed', () => {
    const proposalConfirmed = {
      id: '1',
      author: {
        id: 'author1',
        expiresAt: null,
        email: 'soon@yopmail.com',
      },
      trashedReason: null,
      deletedAt: null,
      publicationStatus: 'PUBLISHED',
    };
    const wrapper = shallow(
      <ProposalAdminStatusForm
        publicationStatus="PUBLISHED"
        relay={{}}
        isSuperAdmin
        isAuthor={false}
        pristine
        invalid={false}
        valid={false}
        submitSucceeded={false}
        submitFailed={false}
        submitting={false}
        dispatch={jest.fn()}
        proposal={proposalConfirmed}
        handleSubmit={jest.fn()}
        intl={global.intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
