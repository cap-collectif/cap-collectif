// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProjectStepAdminList } from './ProjectStepAdminList';
import { $fragmentRefs, $refType } from '~/mocks';

const defaultStep = {
  id: '1',
  title: 'testStep',
  type: 'typeTest',
  url: 'urlTest',
  slug: 'slugTest',
  hasOpinionsFilled: false,
  isAnalysisStep: false,
};

const defaultProps = {
  dispatch: jest.fn(),
  formName: 'oui',
  steps: [defaultStep, defaultStep],
  fields: { length: 0, map: () => [], remove: jest.fn() },
  project: {
    $fragmentRefs,
    $refType,
  },
};

describe('<ProjectStepAdminList />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<ProjectStepAdminList {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
