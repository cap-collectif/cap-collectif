// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminPage } from './ProjectAdminPage';

describe('<ProjectAdminPage />', () => {
  const defaultProps = {
    projectId: 'oui',
    firstCollectStepId: '123456',
  };

  it('renders correctly when editing project', () => {
    const wrapper = shallow(<ProjectAdminPage {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when no project', () => {
    const wrapper = shallow(<ProjectAdminPage projectId={null} firstCollectStepId={null} />);
    expect(wrapper).toMatchSnapshot();
  });
});
