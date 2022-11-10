// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { DashboardMailingList } from './DashboardMailingList';
import { $refType, $fragmentRefs, relayPaginationMock } from '~/mocks';

const baseProps = {
  relay: relayPaginationMock,
  viewer: {
    $refType,
    isOnlyProjectAdmin: false,
  },
  mailingListOwner: {
    $refType,
    mailingLists: {
      totalCount: 2,
      pageInfo: {
        hasNextPage: false,
      },
      edges: [
        {
          node: {
            $fragmentRefs,
            id: '1',
          },
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI7fQ==',
        },
        {
          node: {
            $fragmentRefs,
            id: '1',
          },
          cursor: 'YToyOntpOjA7aToxNDg1OTAzNjAwMDAwO2k6MTtzOjk6InByb3Bvc2FsMSI8fQ==',
        },
      ],
    },
  },
};

const props = {
  basic: baseProps,
};

describe('<DashboardMailingList />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<DashboardMailingList {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });
});
