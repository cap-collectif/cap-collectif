// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminNewsForm } from './ProposalAdminNewsForm';

describe('<ProposalAdminNewsForm />', () => {
  const props = {
    // $FlowFixMe $refType
    proposal: {
      news: [{ id: '1', title: 'news-1' }],
    },
  };
  const props2 = {
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
