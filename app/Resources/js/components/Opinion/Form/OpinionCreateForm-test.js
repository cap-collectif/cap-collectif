// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionCreateForm } from './OpinionCreateForm';
import { formMock, $refType } from '../../../mocks';

describe('<OpinionCreateForm />', () => {
  const props = {
    ...formMock,
    consultation: {
      $refType,
      id: '1',
      project: {
        id: '1',
      },
      titleHelpText: null,
      descriptionHelpText: null,
    },
    section: {
      $refType,
      id: 'section1',
      appendixTypes: [
        {
          id: '1',
          title: 'appendice',
        },
      ],
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<OpinionCreateForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
