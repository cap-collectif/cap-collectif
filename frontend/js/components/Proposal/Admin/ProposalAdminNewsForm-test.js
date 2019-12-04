// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminNewsForm } from './ProposalAdminNewsForm';
import { intlMock, $refType } from '../../../mocks';

describe('<ProposalAdminNewsForm />', () => {
  const props = {
    intl: intlMock,
    proposal: {
      $refType,
      news: {
        totalCount: 1,
        edges: [
          {
            cursor: 'curseurdepagination',
            node: {
              adminUrl: 'https://capco.dev/admin/capco/app/post/19/edit',
              title: 'news-1',
            },
          },
        ],
      },
    },
  };
  const props2 = {
    intl: intlMock,
    proposal: {
      $refType,
      news: {
        totalCount: 0,
        edges: [],
      },
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminNewsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly when there are no news', () => {
    const wrapper = shallow(<ProposalAdminNewsForm {...props2} />);
    expect(wrapper).toMatchSnapshot();
  });
});
