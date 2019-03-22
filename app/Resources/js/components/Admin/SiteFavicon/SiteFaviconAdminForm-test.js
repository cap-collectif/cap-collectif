// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import SiteFaviconAdminForm from './SiteFaviconAdminForm';
import { formMock } from '../../../mocks';

describe('<SiteFaviconAdminPage />', () => {
  it('renders correctly without a favicon set', () => {
    const props = {
      siteFavicon: {
        id: 'siteFaviconId',
        media: null,
      },
      ...formMock,
    };
    const wrapper = shallow(<SiteFaviconAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when a favicon is set', () => {
    const props = {
      siteFavicon: {
        id: 'siteFaviconId',
        media: {
          id: 'mediaId',
          url:
            'https://www.gettyimages.com/gi-resources/images/CreativeLandingPage/HP_Sept_24_2018/CR3_GettyImages-159018836.jpg',
          name: 'Favicon',
        },
      },
      ...formMock,
    };
    const wrapper = shallow(<SiteFaviconAdminForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
