// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageContent } from './ProposalPageContent';
import { $refType, $fragmentRefs } from '../../../mocks';

describe('<ProposalPageContent />', () => {
  const proposal = {
    id: '3',
    body: 'lorem ipsum dolor',
    $refType,
    $fragmentRefs,
    address: null,
    title: 'Titre proposition',
    author: {
      id: '3',
      slug: 'jack',
    },
    media: {
      url: 'http://capco.test',
    },
    form: {
      contribuable: true,
    },
    responses: [],
    publicationStatus: 'PUBLISHED',
    url: true,
    summary: 'Summary',
    currentVotableStep: null,
  };

  const props = {
    dispatch: () => {},
    form: {
      usingThemes: true,
      usingCategories: false,
    },
    categories: [],
    mapTokens: {
      MAPBOX: {
        initialPublicToken:
          '***REMOVED***',
        publicToken:
          '***REMOVED***',
        styleOwner: 'capcollectif',
        styleId: '***REMOVED***',
      },
    },
    className: '',
    step: null,
    viewer: null,
  };

  it('should render a proposal page content', () => {
    const wrapper = shallow(<ProposalPageContent proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
