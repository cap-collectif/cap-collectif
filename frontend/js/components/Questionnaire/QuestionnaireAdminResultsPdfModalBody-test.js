// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import QuestionnaireAdminResultsPdfModalBody from './QuestionnaireAdminResultsPdfModalBody';

describe('<QuestionnaireAdminResultsPdfModalBody />', () => {
  const props = {
    loading: false,
    error: false,
    retryCount: 0,
  };

  const loadingProps = {
    ...props,
    loading: true,
  };

  const errorProps = {
    ...props,
    loading: false,
    error: true,
  };

  const retryCountExceedLimitProps = {
    ...errorProps,
    retryCount: 1,
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalBody {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalBody {...loadingProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when error', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsPdfModalBody {...errorProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when retryCount exceed limit', () => {
    const wrapper = shallow(
      <QuestionnaireAdminResultsPdfModalBody {...retryCountExceedLimitProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
