// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminStatusForm } from './ProposalAdminStatusForm';

describe('<ProposalAdminStatusForm />', () => {
  it('render correctly if published but user can soon expire', () => {
    const proposalToBeExpired = {
      id: '1',
      trashedReason: null,
      author: {
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
        relay={{}}
        proposal={proposalToBeExpired}
        handleSubmit={jest.fn()}
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
        proposal={proposalExpired}
        handleSubmit={jest.fn()}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly if published and user is confirmed', () => {
    const proposalConfirmed = {
      id: '1',
      author: {
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
        proposal={proposalConfirmed}
        handleSubmit={jest.fn()}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
