// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionPrintHelpText } from './QuestionPrintHelpText';

describe('<QuestionPrintHelpText />', () => {
  const props = {
    validationRule: null,
    questionType: 'ranking',
    choices: [{ id: 'question1' }, { id: 'question2' }, { id: 'question3' }],
    helpPrint: true,
  };

  it('should render correctly ranking text with min validation rule', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ validationRule: { type: 'MIN', number: 1 } });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly select text with equal validation rule', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ validationRule: { type: 'EQUAL', number: 2 }, questionType: 'select' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly checkbox text with max validation rule', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ validationRule: { type: 'MAX', number: 3 }, questionType: 'checkbox' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly checkbox text without validation rule', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'checkbox' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly checkbox text without validation rule & false helpPrint', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'checkbox', helpPrint: false });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly button text', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'button' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly image text', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'image' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly medias text', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'medias' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly number text', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'number' });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null', () => {
    const wrapper = shallow(<QuestionPrintHelpText {...props} />);
    wrapper.setProps({ questionType: 'text' });
    expect(wrapper).toMatchSnapshot();
  });
});
