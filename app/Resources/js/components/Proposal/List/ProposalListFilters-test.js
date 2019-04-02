// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListFilters } from './ProposalListFilters';

describe('<ProposalListFilters />', () => {
  const defaultProps = {
    step: {
      id: 'test',
      defaultSort: 'random',
      voteType: 'DISABLED',
      statuses: {},
      form: {},
      private: false,
    },
    features: {
      user_type: true,
    },
    themes: [{}, {}, {}, {}],
    types: [{}, {}, {}, {}],
    filters: {},
  };

  it('should render correctly', () => {
    // $FlowFixMe
    const wrapper = shallow(<ProposalListFilters {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with filters', () => {
    const props = {
      ...defaultProps,
      themes: [
        {
          id: 1,
          name: 'Citoyen',
        },
      ],
      types: [
        {
          id: 'theme1',
          slug: 'immobilier',
          title: 'Immobilier',
        },
      ],
    };
    // $FlowFixMe
    const wrapper = shallow(<ProposalListFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
