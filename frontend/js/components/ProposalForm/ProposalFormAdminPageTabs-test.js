// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPageTabs } from './ProposalFormAdminPageTabs';
import { $fragmentRefs, intlMock, $refType } from '../../mocks';

describe('<ProposalFormAdminPageTabs />', () => {
  const proposalForm = {
    $refType,
    $fragmentRefs,
    url: 'http://capco.dev/top-budget',
    reference: '2',
    step: {
      id: '<random id>',
    },
  };

  const props = {
    analysisFeatureEnabled: true,
    intl: intlMock,
    proposalForm,
    query: {
      $refType,
      $fragmentRefs,
    },
  };

  it('doesnt render a (new) analysis tab, if feature is not enabled', () => {
    const wrapper = shallow(
      <ProposalFormAdminPageTabs {...props} analysisFeatureEnabled={false} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('doesnt render a (new)  analysis tab, if form is not linked to a step yet', () => {
    const wrapper = shallow(
      <ProposalFormAdminPageTabs {...props} proposalForm={{ ...proposalForm, step: null }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render a (new) analysis tab', () => {
    const wrapper = shallow(<ProposalFormAdminPageTabs {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
