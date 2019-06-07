// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShieldAdminForm } from './ShieldAdminForm';
import { formMock, $refType } from '../../mocks';

describe('<ShieldAdminForm />', () => {
  const props = {
    shieldAdminForm: {
      ...$refType,
      shieldMode: true,
      introduction: '<p>Introduction text in shield mode</p>',
      image: {
        id: 'image-uuid',
        name: 'image-name.jpg',
        url: 'https://capco.test/media/default/0001/01/image-name.jpg',
      },
    },
    ...formMock,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ShieldAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
