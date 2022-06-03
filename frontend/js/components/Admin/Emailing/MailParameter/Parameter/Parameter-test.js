// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ParameterPage } from './index';
import { $refType, $fragmentRefs } from '~/mocks';
import MockProviders from '~/testUtils';

const baseProps = {
  disabled: false,
  showError: false,
  emailingCampaign: {
    $refType,
    mailingListFragment: {
      $fragmentRefs,
      name: 'Je suis une mailingList',
      project: {
        title: 'P&C',
      },
      mailingListUsers: {
        totalCount: 3,
      },
      mailingListUsersConsenting: {
        totalCount: 3,
      },
    },
    senderEmail: 'assistance@cap-collectif.com',
    emailingGroup: null,
    mailingInternal: null,
    project: null,
  },
  query: {
    $refType,
    viewer: {
      mailingLists: {
        totalCount: 2,
        edges: [
          {
            node: {
              id: '1',
              name: 'Je suis une mailingList',
            },
          },
          {
            node: {
              id: '2',
              name: 'Je suis une mailingList aussi',
            },
          },
        ],
      },
      projects: {
        totalCount: 1,
        edges: [
          {
            node: {
              id: '1',
              title: 'Je suis un project',
            },
          },
        ],
      },
      isAdmin: true,
    },
    users: {
      totalCount: 30,
    },
    usersConfirmed: {
      totalCount: 15,
    },
    usersNotConfirmed: {
      totalCount: 15,
    },
    usersRefusing: {
      totalCount: 3,
    },
    usersConfirmedRefusing: {
      totalCount: 2,
    },
    usersNotConfirmedRefusing: {
      totalCount: 1,
    },
    senderEmails: [
      {
        id: 'senderEmail-123',
        address: 'sender-email@gmail.com',
      },
      {
        id: 'senderEmail-456',
        address: 'sender-email2@gmail.com',
      },
    ],
    groups: {
      totalCount: 2,
      edges: [
        {
          node: {
            id: '1',
            title: 'Je suis un groupe',
          },
        },
        {
          node: {
            id: '2',
            title: 'Je suis un groupe aussi',
          },
        },
      ],
    },
  },
};

const props = {
  basic: baseProps,
  disabled: {
    ...baseProps,
    disabled: true,
  },
  withError: {
    ...baseProps,
    showError: true,
  },
  withMailingListInternal: {
    ...baseProps,
    emailingCampaign: {
      ...baseProps.emailingCampaign,
      mailingInternal: 'CONFIRMED',
    },
  },
};

describe('<ParameterPage />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(
      <MockProviders>
        <ParameterPage {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when disabled', () => {
    const wrapper = shallow(
      <MockProviders>
        <ParameterPage {...props.disabled} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when error', () => {
    const wrapper = shallow(
      <MockProviders>
        <ParameterPage {...props.withError} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when mailing list internal selected', () => {
    const wrapper = shallow(
      <MockProviders>
        <ParameterPage {...props.withMailingListInternal} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
