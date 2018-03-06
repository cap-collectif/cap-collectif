// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminNewsForm } from './ProposalAdminNewsForm';
import { intlMock } from '../../../mocks';

describe('<ProposalAdminNewsForm />', () => {
  const props = {
    intl: intlMock,
    // $FlowFixMe $refType
    proposal: {
      news: [{ id: '1', title: 'news-1' }],
    },
  };
  const props2 = {
    intl: intlMock,
    // $FlowFixMe $refType
    proposal: {
      news: [],
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
