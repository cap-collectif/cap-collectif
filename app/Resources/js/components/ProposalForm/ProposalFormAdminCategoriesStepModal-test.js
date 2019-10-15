// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../mocks';
import { ProposalFormAdminCategoriesStepModal } from './ProposalFormAdminCategoriesStepModal';

describe('<ProposalFormAdminCategoriesStepModal />', () => {
  const props = {
    show: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    member: 'member',
    isUpdating: true,
    category: {
      categoryImage: {},
    },
    query: {
      categoryImages: [
        {
          id: 'categoryImageId',
          image: {
            id: 'capco',
            name: 'predefinedImage',
            url: 'http://capco.predefinedImage.jpg',
          },
        },
      ],
      customCategoryImages: [
        {
          id: 'customCategoryImage',
          image: {
            id: 'uploadedId',
            name: 'customimage',
            url: 'http://isitckPhoto.customimage.jpg',
          },
        },
      ],
      $refType,
    },
    formName: 'myForm',
    dispatch: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategoriesStepModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
