// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { AdminExportButton } from './AdminExportButton';

describe('<ProposalCreateFusionButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<AdminExportButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
