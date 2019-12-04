// @flow
/* eslint-env jest */
import React from 'react';
import moment from 'moment-timezone';
import { shallow } from 'enzyme';
import { DatesInterval } from './DatesInterval';

describe('<DatesInterval />', () => {
  beforeEach(() => {
    moment.locale('fr');
    moment.tz.setDefault('Europe/Paris');
    // $FlowFixMe console.log is not writable
    console.log = jest.fn();
    // TODO use render and IntlProvider
    // store = {
    //   subscribe: jest.fn(),
    //   dispatch: jest.fn(),
    //   getState: jest.fn().mockReturnValueOnce({ intl: { locale: 'fr' } }),
    // };
  });

  const props1 = {
    startAt: '2019-03-08 09:39:58',
    endAt: '2019-04-10 02:46:47',
    fullDay: true,
  };

  it('should shallow a full date', () => {
    const wrapper = shallow(<DatesInterval {...props1} />);
    expect(wrapper).toMatchSnapshot();
  });

  // TODO find a way to properly test timezones…
  //
  // it('should shallow a full date with timeZone support', () => {
  //   const timeZone = 'America/New York';
  //   moment.tz.setDefault(timeZone);
  //   const wrapper = shallow(<DatesInterval {...props1} />);
  //   expect(wrapper).toMatchSnapshot();
  // });

  it('should shallow a full date without end time', () => {
    const props2 = {
      startAt: '2018-01-26T03:00:00+01:00',
      endAt: '2018-02-04T00:00:00+01:00',
      fullDay: true,
    };
    const wrapper = shallow(<DatesInterval {...props2} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow a full date without start time', () => {
    const props = {
      startAt: '2018-01-26T00:00:00+01:00',
      endAt: '2018-02-04T04:00:00+01:00',
      fullDay: true,
    };
    const wrapper = shallow(<DatesInterval {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow a full date without end & start time', () => {
    const props = {
      startAt: '2018-01-26T00:00:00+01:00',
      endAt: '2018-02-04T00:00:00+01:00',
      fullDay: true,
    };
    const wrapper = shallow(<DatesInterval {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow correctly start date', () => {
    const props = {
      startAt: '2018-01-26T03:00:00+01:00',
      fullDay: true,
    };
    const wrapper = shallow(<DatesInterval {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow correctly end date', () => {
    const props = {
      endAt: '2018-02-10T09:00:24+00:00',
      fullDay: true,
    };
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props} />); // 10/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow correctly end date without end time', () => {
    const props = {
      endAt: '2018-02-10T00:00:00+00:00',
      fullDay: true,
    };
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props} />); // 10/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow correctly past date', () => {
    const props = {
      endAt: '2017-02-01T00:00:00+00:00',
      fullDay: true,
    };
    (Date: any).now = jest.fn(() => 1517848349000); // 5/02/2018
    const wrapper = shallow(<DatesInterval {...props} />); // 01/02/2018
    expect(wrapper).toMatchSnapshot();
  });

  it('should shallow null', () => {
    const props = {
      fullDay: true,
    };
    const wrapper = shallow(<DatesInterval {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
