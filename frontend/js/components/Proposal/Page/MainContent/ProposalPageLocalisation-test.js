/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageLocalisation } from './ProposalPageLocalisation';
import { $refType } from '~/mocks';

const generateMockProposal = () => ({
  $refType,
  id: 'proposal1',
  form: {
    usingAddress: true,
  },
  address: {
    formatted: '111 Avenue Jean Jaurès, 69007 Lyon, France',
    lat: 45.742842,
    lng: 4.84068000000002,
  },
});

describe('<ProposalPageLocalisation />', () => {
  let proposal = generateMockProposal();

  beforeEach(() => {
    proposal = generateMockProposal();
  });

  const mapTokens = {
    MAPBOX: {
      styleId: 'string',
      styleOwner: 'string',
      publicToken: 'string',
      initialPublicToken: 'string',
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalPageLocalisation proposal={proposal} mapTokens={mapTokens} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should be empty if address is not enabled on form', () => {
    proposal.form.usingAddress = false;
    const wrapper = shallow(<ProposalPageLocalisation proposal={proposal} mapTokens={mapTokens} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('should be empty if address is null', () => {
    // $FlowFixMe type is readonly, but we don't care in tests
    proposal.address = null;
    const wrapper = shallow(<ProposalPageLocalisation proposal={proposal} mapTokens={mapTokens} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});
