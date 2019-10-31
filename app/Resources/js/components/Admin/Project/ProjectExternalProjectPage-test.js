// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectExternalProjectAdminPage } from './ProjectExternalProjectAdminPage';
import { $fragmentRefs } from '../../../mocks';
import { features } from '~/redux/modules/default';

describe('<ProjectExternalProjectAdminPage />', () => {
  const defaultProps = {
    project: {
      $fragmentRefs,
    },
    features,
  };

  it('renders correctly when editing project', () => {
    const wrapper = shallow(
      <ProjectExternalProjectAdminPage {...defaultProps} hostUrl="capco.dev" />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when no project', () => {
    const wrapper = shallow(
      <ProjectExternalProjectAdminPage project={null} features={features} hostUrl="capco.dev" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
