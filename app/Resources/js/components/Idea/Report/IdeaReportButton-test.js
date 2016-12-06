/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
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
    const wrapper = shallow(<IdeaReportButton {...props} {...IntlData} />);
    const reportBox = wrapper.find('Connect(ReportBox)');
    expect(reportBox).to.have.length(1);
    expect(reportBox.prop('reported')).to.equal(props.idea.userHasReport);
    expect(reportBox.prop('onReport')).to.be.a.function;
    expect(reportBox.prop('author')).to.equal(props.idea.author);
    expect(reportBox.prop('buttonClassName')).to.equal('idea__btn--report');
  });
});
