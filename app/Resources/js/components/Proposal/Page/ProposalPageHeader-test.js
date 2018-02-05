/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../../mocks';
import { ProposalPageHeader } from './ProposalPageHeader';

describe('<ProposalPageHeader />', () => {
  const proposal = {
    theme: {
      title: 'Titre du thème',
    },
    title: 'Titre',
    author: {},
  };

  const proposalWithoutTheme = {
    title: 'Titre',
    author: {},
    referer: 'http://capco.test',
  };

  const props = {
    userHasVote: false,
    intl: intlMock,
    onVote: () => {},
    referer: 'http://capco.test',
  };

  Date.now = jest.fn(() => 1517411601252);

  it('should render a proposal header', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render theme if proposal has none', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposalWithoutTheme} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render theme if specified not to', () => {
    const wrapper = shallow(<ProposalPageHeader proposal={proposal} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a div with specified classes', () => {
    const wrapper = shallow(
      <ProposalPageHeader proposal={proposal} className="css-class" {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
