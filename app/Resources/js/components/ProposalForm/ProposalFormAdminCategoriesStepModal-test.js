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
    isCreating: true,
    categoryImages: [
      {
        $refType,
        id: '1',
        image: null,
      },
    ],
    newCategoryImage: null,
    categoryImage: {
      id: 'categoryImageId',
      image: {
        id: 'uploadedId',
        name: 'imageName',
        url: 'http://isitckPhoto.monimage.jpg',
      },
    },
    formName: 'myForm',
    dispatch: jest.fn(),
  };

  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategoriesStepModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
