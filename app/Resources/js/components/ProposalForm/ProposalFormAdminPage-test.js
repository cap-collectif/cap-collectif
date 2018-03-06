// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormAdminPage } from './ProposalFormAdminPage';
import { intlMock } from '../../mocks';

describe('<ProposalFormAdminPage />', () => {
  const props = {
    intl: intlMock,
    proposalFormId: '1',
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
