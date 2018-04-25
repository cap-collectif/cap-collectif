/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPage } from './ProposalPage';
import { features } from '../../../redux/modules/default';
import { VOTE_TYPE_SIMPLE, VOTE_TYPE_DISABLED } from '../../../constants/ProposalConstants';

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
    steps: [{ id: '1', voteType: VOTE_TYPE_DISABLED }, { id: '2', voteType: VOTE_TYPE_SIMPLE }],
    viewerCanSeeEvaluation: true,
  };

  const proposalId = '41';

  it('should render a proposal page', () => {
    const wrapper = shallow(<ProposalPage {...props} isAuthenticated proposalId={proposalId} />);
    expect(wrapper).toMatchSnapshot();
  });
});
