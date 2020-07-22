// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ShieldAdminForm } from './ShieldAdminForm';
import { formMock, $refType, intlMock } from '../../../mocks';
import { features } from '~/redux/modules/default';

describe('<ShieldAdminForm />', () => {
  const props = {
    shieldAdminForm: {
      ...$refType,
      shieldMode: true,
      translations: [
        {
          introduction: '<p>Introduction text in shield mode</p>',
          locale: 'fr-FR',
        },
      ],
      media: {
        id: 'image-uuid',
        name: 'image-name.jpg',
        url: 'https://capco.test/media/default/0001/01/image-name.jpg',
      },
    },
    features: {
      ...features,
    },
    intl: intlMock,
    currentLanguage: 'fr-FR',
    ...formMock,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ShieldAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
