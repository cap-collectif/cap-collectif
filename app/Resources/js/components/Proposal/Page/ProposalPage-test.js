/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';
import { features } from '../../../redux/modules/default';

describe('<ProposalPage />', () => {
  const props = {
    form: {
      usingThemes: true,
      usingCategories: false,
    },
    themes: [],
    districts: [],
    categories: [],
    features: {
      ...features,
      themes: true,
      districts: false,
    },
  };

  const proposalId = '41';

  it('should render a proposal page', () => {
    const wrapper = shallow(
      <ProposalPage
        {...props}
        isAuthenticated
        currentVotableStepId={null}
        proposalId={proposalId}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
