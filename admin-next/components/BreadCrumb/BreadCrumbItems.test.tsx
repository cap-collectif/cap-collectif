/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import BreadCrumbItems from './BreadCrumbItems';
import {BreadCrumbItemType} from "./BreadCrumbItem";

describe('<BreadCrumbItems />', () => {
    let testComponentTree: any;

    const singleItem = [{
        title: 'Project list',
        href: '/projects'
    }]

    const multipleItems: Array<BreadCrumbItemType> = [
        {
            title: 'Project list',
            href: '/projects'
        },
        {
            title: 'New Project',
            href: ''
        },
    ]

    it('should render one single item', () => {
        testComponentTree = ReactTestRenderer.create(
            <BreadCrumbItems breadCrumbItems={singleItem}/>
        );
        expect(testComponentTree).toMatchSnapshot();
    });

    it('should render multiple items with slash in between them', () => {
        testComponentTree = ReactTestRenderer.create(
            <BreadCrumbItems breadCrumbItems={multipleItems} />
        );
        expect(testComponentTree).toMatchSnapshot();
    });
});
