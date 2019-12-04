// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../mocks';
import { ProposalFormAdminCategoriesStepModal } from './ProposalFormAdminCategoriesStepModal';
import { features } from '~/redux/modules/default';

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
    features,
    formName: 'myForm',
    dispatch: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategoriesStepModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render correctly illustartion enabled', () => {
    const defaultProps = {
      ...props,
      features: {
        ...features,
        display_pictures_in_depository_proposals_list: true,
      },
    };
    const wrapper = shallow(<ProposalFormAdminCategoriesStepModal {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
