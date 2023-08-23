// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalListFilters } from './ProposalListFilters';
import { features } from '~/redux/modules/default';
import { $refType, $fragmentRefs, intlMock } from '~/mocks';

describe('<ProposalListFilters />', () => {
  const defaultProps = {
    setDisplayMode: jest.fn(),
    dispatch: jest.fn(),
    intl: intlMock,
    step: {
      $refType,
      $fragmentRefs,
      id: 'test',
      defaultSort: 'random',
      voteType: 'DISABLED',
      votesRanking: true,
      statuses: [],
      canDisplayBallot: true,
      form: {
        usingAddress: true,
        usingDistrict: true,
        usingThemes: true,
        commentable: true,
        costable: true,
        usingCategories: true,
        districts: [
          {
            id: '1',
            name: 'Ouagadougou',
          },
        ],
        categories: [
          {
            id: '2',
            name: 'Category1',
          },
        ],
        objectType: 'PROPOSAL',
      },
      proposalArchivedTime: 0,
    },
    features: { ...features, user_type: true },
    themes: [],
    types: [],
    filters: {
      themes: null,
      categories: null,
      districts: null,
      statuses: null,
      types: null,
      state: null,
    },
    displayMode: 'GRID',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ProposalListFilters {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with filters', () => {
    const props = {
      ...defaultProps,
      statuses: [
        {
          id: 1,
          name: 'Status1',
        },
      ],
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
  it('should render correctly without vote filters filters', () => {
    const props = {
      ...defaultProps,
      step: {
        $refType,
        $fragmentRefs,
        id: 'test',
        defaultSort: 'random',
        voteType: 'DISABLED',
        votesRanking: true,
        statuses: [],
        canDisplayBallot: false,
        form: {
          usingAddress: true,
          usingDistrict: true,
          usingThemes: true,
          commentable: true,
          costable: true,
          usingCategories: true,
          districts: [
            {
              id: '1',
              name: 'Ouagadougou',
            },
          ],
          categories: [
            {
              id: '2',
              name: 'Category1',
            },
          ],
        },
      },
    };
    // $FlowFixMe
    const wrapper = shallow(<ProposalListFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
