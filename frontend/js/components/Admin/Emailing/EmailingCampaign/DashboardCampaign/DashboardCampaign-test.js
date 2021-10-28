// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DashboardCampaign } from './DashboardCampaign';
import { $refType, $fragmentRefs, relayPaginationMock } from '~/mocks';

const baseProps = {
  relay: relayPaginationMock,
  query: {
    $refType,
    viewer: {
      campaigns: {
        totalCount: 2,
        pageInfo: {
          hasNextPage: false,
        },
        edges: [
          {
            node: {
              $fragmentRefs,
              id: '1',
              status: 'SENT',
            },
            cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==',
          },
          {
            node: {
              $fragmentRefs,
              id: '1',
              status: 'DRAFT',
            },
            cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI8fQ==',
          },
        ],
      },
      campaignsAll: {
        totalCount: 4,
      },
      campaignsSent: {
        totalCount: 1,
      },
      campaignsDraft: {
        totalCount: 2,
      },
      campaignsPlanned: {
        totalCount: 1,
      },
    },
  },
};

const props = {
  basic: baseProps,
  noCampaigns: {
    ...baseProps,
    query: {
      ...baseProps.query,
      viewer: {
        campaigns: {
          totalCount: 2,
          pageInfo: {
            hasNextPage: false,
          },
          edges: [],
        },
        campaignsAll: {
          totalCount: 0,
        },
        campaignsSent: {
          totalCount: 0,
        },
        campaignsDraft: {
          totalCount: 0,
        },
        campaignsPlanned: {
          totalCount: 0,
        },
      },
    },
  },
};

describe('<DashboardCampaign />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DashboardCampaign {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly with no campaigns', () => {
    const wrapper = shallow(<DashboardCampaign {...props.noCampaigns} />);
    expect(wrapper).toMatchSnapshot();
  });
});
