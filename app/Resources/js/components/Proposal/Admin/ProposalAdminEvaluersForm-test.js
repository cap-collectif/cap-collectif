// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalAdminEvaluersForm } from './ProposalAdminEvaluersForm';

describe('<ProposalAdminEvaluersForm />', () => {
  const props = {
    ...global.formMock,
    intl: global.intlMock,
    disabled: false,
    proposal: {
      id: '1',
      evaluers: [{ id: 'group1', title: 'Group 1' }],
    },
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalAdminEvaluersForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
