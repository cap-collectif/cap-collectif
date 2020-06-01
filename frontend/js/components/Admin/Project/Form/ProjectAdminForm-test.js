// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectAdminForm } from './ProjectAdminForm';
import { formMock, intlMock, $refType, $fragmentRefs } from '~/mocks';
import { features } from '~/redux/modules/default';

describe('<ProjectAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    title: 'testTitle',
    onTitleChange: jest.fn(),
    project: {
      $fragmentRefs,
      $refType,
      id: '1',
      title: 'testTitle',
      type: {
        id: '1',
      },
      video: 'dailymotion.com/issou',
      Cover: null,
      authors: [],
      steps: [],
      themes: [],
      districts: null,
      metaDescription: 'so meta',
      opinionTerm: 1,
      opinionCanBeFollowed: true,
      isExternal: false,
      externalLink: null,
      publishedAt: '22/22/22',
      url: '/project1',
      visibility: 'ADMIN',
      externalVotesCount: null,
      externalParticipantsCount: null,
      externalContributionsCount: null,
      locale: null,
      restrictedViewers: null,
    },
    features,
    initialGroups: [],
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
