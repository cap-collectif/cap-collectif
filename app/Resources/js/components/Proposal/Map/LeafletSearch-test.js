// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LeafletSearch } from './LeafletSearch';

describe('<LeafletSearch />', () => {

    it('should render', () => {
        const wrapper = shallow(<LeafletSearch />);
        expect(wrapper).toMatchSnapshot();
    });

});
