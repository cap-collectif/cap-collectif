// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminNewsForm } from './ProposalAdminNewsForm';

describe('<ProposalAdminNewsForm />', () => {
  const props = {
    proposal: {
      news: [{ id: '1', title: 'news-1' }],
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminNewsForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
