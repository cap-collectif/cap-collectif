// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { HomePageProjectsSectionAdminPage } from './HomePageProjectsSectionAdminPage';
import { $fragmentRefs, intlMock, formMock, $refType } from '~/mocks';

const props = {
  paginatedProjectsFragmentRef: $fragmentRefs,
  allProjectsFragmentRef: $fragmentRefs,
  homePageProjectsSectionAdminFragmentRef: $fragmentRefs,
  displayMode: 'MOST_RECENT',
  homePageProjectsSectionAdmin: {
    id: 'SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=',
    title: 'titre',
    position: 3,
    teaser: 'sous titre',
    displayMode: 'MOST_RECENT',
    enabled: true,
    nbObjects: 4,
    projects: {
      edges: [],
    },
    $refType,
  },
  currentLanguage: 'fr-FR',
  maxProjectsDisplay: 9,
  intl: intlMock,
  ...formMock,
};

describe('<HomePageProjectsSectionAdminPage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<HomePageProjectsSectionAdminPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
