// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { features } from '../../redux/modules/default';
import { ProposalFormAdminConfigurationForm } from './ProposalFormAdminConfigurationForm';

describe('<ProposalFormAdminConfigurationForm />', () => {
  const props = {
    intl: global.intlMock,
    proposalForm: {},
    features,
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminConfigurationForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
