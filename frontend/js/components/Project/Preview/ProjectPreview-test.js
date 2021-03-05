// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $fragmentRefs, $refType } from '~/mocks';
import { features } from '~/redux/modules/default';

import { ProjectPreview } from './ProjectPreview';

const defaultProject = {
  project: {
    $refType,
    $fragmentRefs,
    id: 'UHJvamVjdDpwcm9qZWN0MQ==',
  },
  features,
  isProjectsPage: false,
};

describe('<ProjectPreview />', () => {
  it('should render correctly project with participative step, without type', () => {
    const wrapper = shallow(<ProjectPreview {...defaultProject} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with the new card type', () => {
    const wrapper = shallow(
      <ProjectPreview
        {...defaultProject}
        features={{ ...features, unstable__new_project_card: true }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
