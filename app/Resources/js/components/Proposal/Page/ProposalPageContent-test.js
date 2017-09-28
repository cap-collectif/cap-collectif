/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProposalPageContent } from './ProposalPageContent';

describe('<ProposalPageContent />', () => {
  const proposal = {
    title: 'Titre proposition',
    author: {},
    referer: 'http://capco.test',
    responses: [],
    _links: {
      show: 'http://capco.test',
    },
    id: 'proposal3',
  };

  const props = {
    dispatch: () => {},
    form: {
      usingThemes: true,
      usingCategories: false,
    },
    categories: [],
    className: '',
  };

  it('should render a proposal page content', () => {
    const wrapper = shallow(<ProposalPageContent proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
