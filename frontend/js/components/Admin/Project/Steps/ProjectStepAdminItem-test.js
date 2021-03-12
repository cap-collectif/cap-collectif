// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdminItem } from './ProjectStepAdminItem';
import { $fragmentRefs, $refType } from '~/mocks';

const defaultStep = {
  id: '1',
  title: 'testStep',
  type: 'typeTest',
  url: 'urlTest',
  slug: 'urlTest',
  hasOpinionsFilled: false,
  isAnalysisStep: false,
  debateType: 'FACE_TO_FACE',
};

const defaultProps = {
  formName: 'oui',
  index: 0,
  step: defaultStep,
  fields: { length: 0, map: () => [], remove: jest.fn() },
  project: {
    $fragmentRefs,
    $refType,
  },
};

describe('<ProjectStepAdminItem />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminItem {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without id', () => {
    const props = {
      ...defaultProps,
      step: {
        ...defaultStep,
        id: null,
      },
    };
    const wrapper = shallow(<ProjectStepAdminItem {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
