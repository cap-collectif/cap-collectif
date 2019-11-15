// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectMetadataAdminForm } from './ProjectMetadataAdminForm';
import { formMock, intlMock, $refType } from '~/mocks';

describe('<ProjectMetadataAdminForm />', () => {
  const defaultProps = {
    ...formMock,
    intl: intlMock,
    project: null,
    formName: 'form',
  };

  it('renders correctly empty', () => {
    const wrapper = shallow(<ProjectMetadataAdminForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with a project', () => {
    const props = {
      ...defaultProps,
      project: {
        $refType,
        publishedAt: '2019-11-28 09:00:00',
        id: '1',
        title: 'project',
        Cover: {
          id: 'img1',
          name: 'image',
          size: '10',
          url: 'http://test.com',
        },
        themes: [
          {
            value: '0',
            label: 'theme0',
          },
        ],
        video: 'https://www.youtube.com/watch?v=sCNrK-n68CM',
        districts: {
          edges: [
            {
              node: {
                value: 'district1',
                label: 'Puttelange-aux-lacs',
              },
            },
          ],
        },
      },
    };
    const wrapper = shallow(<ProjectMetadataAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
