// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ParameterPage } from './index';
import { $refType, $fragmentRefs } from '~/mocks';
import MockProviders from '~/testUtils';

const userAdmin = {
  isAdmin: true,
};

const baseProps = {
  disabled: false,
  showError: false,
  emailingCampaign: {
    $refType,
    mailingList: {
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
    mailingInternal: null,
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
      <MockProviders store={{ user: { user: userAdmin } }}>
        <ParameterPage {...props.basic} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when disabled', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: userAdmin } }}>
        <ParameterPage {...props.disabled} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when error', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: userAdmin } }}>
        <ParameterPage {...props.withError} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when mailing list internal selected', () => {
    const wrapper = shallow(
      <MockProviders store={{ user: { user: userAdmin } }}>
        <ParameterPage {...props.withMailingListInternal} />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
