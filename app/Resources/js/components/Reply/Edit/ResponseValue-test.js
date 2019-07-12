// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../../mocks';
import { ResponseValue } from './ResponseValue';

describe('<UpdateReplyModal />', () => {
  const defaultProps = {
    show: true,
    onClose: () => {},
    response: {
      $refType,
      value: '{"value": "myValue", "labels": [], "other": "otherValue"}',
      question: {
        id: 'question1',
        type: 'radio',
      },
    },
  };

  it('should render correctly with minimal props', () => {
    const wrapper = shallow(<ResponseValue {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with minimal null value', () => {
    const wrapper = shallow(
      <ResponseValue {...defaultProps} response={{ ...defaultProps.response, value: null }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with question type editor', () => {
    const editorType = {
      question: {
        id: 'question1',
        type: 'editor',
      },
    };

    const wrapper = shallow(
      <ResponseValue
        {...defaultProps}
        response={{ ...defaultProps.response, question: editorType.question }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with question type medias', () => {
    const editorType = {
      question: {
        id: 'question1',
        type: 'medias',
      },
    };

    const wrapper = shallow(
      <ResponseValue
        {...defaultProps}
        response={{
          ...defaultProps.response,
          question: editorType.question,
          medias: [{ url: 'medias.jpg', name: 'monMedia' }],
        }}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with question type ranking', () => {
    const rankingProps = {
      value: '{"value": "myValue", "labels":  ["rankingLabel1","rankingLabel2","rankingLabel3"]}',
      question: {
        id: 'question1',
        type: 'ranking',
      },
    };

    const wrapper = shallow(
      <ResponseValue {...defaultProps} response={{ ...defaultProps.response, ...rankingProps }} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
