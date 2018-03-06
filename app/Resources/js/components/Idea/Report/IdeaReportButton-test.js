/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeaReportButton } from './IdeaReportButton';

const props = {
  dispatch: () => {},
  idea: {
    id: 1,
    userHasReport: false,
    author: {
      displayName: 'user',
    },
  },
};

describe('<IdeaReportButton />', () => {
  it('should render a report box', () => {
    const wrapper = shallow(<IdeaReportButton {...props} />);
    const reportBox = wrapper.find('Connect(ReportBox)');
    expect(reportBox).toHaveLength(1);
    expect(reportBox.prop('reported')).toEqual(props.idea.userHasReport);
    expect(reportBox.prop('onReport')).toBeDefined();
    expect(reportBox.prop('author')).toEqual(props.idea.author);
    expect(reportBox.prop('buttonClassName')).toEqual('idea__btn--report');
  });
});
