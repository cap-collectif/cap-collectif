// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminStatusForm } from './ProposalAdminStatusForm';
import { intlMock, $refType } from '../../../mocks';

describe('<ProposalAdminStatusForm />', () => {
  it('render correctly if unpublished', () => {
    const proposalUnpulished = {
      id: 'proposal1',
      $refType,
      trashedReason: null,
      author: { id: 'author1', isEmailConfirmed: false, email: 'soon@yopmail.com' },
      deletedAt: null,
      publicationStatus: 'UNPUBLISHED',
    };
    const wrapper = shallow(
      <ProposalAdminStatusForm
        publicationStatus="UNPUBLISHED"
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
        proposal={proposalUnpulished}
        handleSubmit={jest.fn()}
        intl={intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly if published', () => {
    const proposalPubblished = {
      id: 'proposal1',
      $refType,
      author: {
        id: 'author1',
        isEmailConfirmed: true,
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
        proposal={proposalPubblished}
        handleSubmit={jest.fn()}
        intl={intlMock}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
