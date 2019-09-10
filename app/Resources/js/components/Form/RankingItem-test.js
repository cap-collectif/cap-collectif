// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import RankingItem from './RankingItem';

const arrowFunctions = {
  left: () => {},
};

const item = {
  label: 'Choix 1',
  description: 'Description',
  image: {
    url: 'test.png',
  },
};

const itemWithoutDescription = {
  label: 'Choix 1',
  image: {
    url: 'test.png',
  },
};

const itemWithoutImage = {
  label: 'Choix 1',
  description: 'Description',
};

const props = {
  id: 'id',
  connectDragSource: cp => cp,
  arrowFunctions,
};

const OriginalComponent = RankingItem.DecoratedComponent;

describe('<RankingItem />', () => {
  it('should render ranking item', () => {
    const wrapper = shallow(
      <OriginalComponent {...props} item={item} disabled={false} isDragging={false} />,
    );
    const container = wrapper.find('.ranking__item');
    expect(container).toHaveLength(1);
    expect(container.prop('style').opacity).toEqual(1);
    expect(container.hasClass('list-group-item')).toEqual(true);
    expect(container.hasClass('disabled')).toEqual(false);
    expect(wrapper.find('.ranking__item__icon')).toHaveLength(1);
    expect(wrapper.find('i.cap.cap-cursor-move')).toHaveLength(1);
    const label = wrapper.find('.ranking__item__label');
    expect(label).toHaveLength(1);
    expect(label.text()).toEqual('Choix 1');
    const arrows = wrapper.find('RankingArrows');
    expect(arrows).toHaveLength(1);
    expect(arrows.prop('item')).toEqual(item);
    expect(arrows.prop('arrowFunctions')).toEqual(arrowFunctions);
    expect(arrows.prop('disabled')).toEqual(false);
    const description = wrapper.find('.ranking__item__description');
    expect(description).toHaveLength(1);
    expect(description.html()).toEqual(
      '<div class="excerpt small ranking__item__description ql-editor">Description</div>',
    );
    const image = wrapper.find('.ranking__item__image');
    expect(image).toHaveLength(1);
    expect(image.prop('src')).toEqual('test.png');
  });

  it('should render transparent item when dragged', () => {
    const wrapper = shallow(
      <OriginalComponent {...props} item={item} disabled={false} isDragging />,
    );
    const container = wrapper.find('.ranking__item');
    expect(container).toHaveLength(1);
    expect(container.prop('style').opacity).toEqual(0.5);
  });

  it('should render disabled item when required', () => {
    const wrapper = shallow(
      <OriginalComponent {...props} item={item} disabled isDragging={false} />,
    );
    const container = wrapper.find('.ranking__item');
    expect(container).toHaveLength(1);
    expect(container.hasClass('disabled')).toEqual(true);
    const arrows = wrapper.find('RankingArrows');
    expect(arrows).toHaveLength(1);
    expect(arrows.prop('disabled')).toEqual(true);
  });

  it('should render no description when item has not', () => {
    const wrapper = shallow(
      <OriginalComponent
        {...props}
        item={itemWithoutDescription}
        disabled={false}
        isDragging={false}
      />,
    );
    const description = wrapper.find('.ranking__item__description');
    expect(description).toHaveLength(0);
  });

  it('should render no image when item has not', () => {
    const wrapper = shallow(
      <OriginalComponent {...props} item={itemWithoutImage} disabled={false} isDragging={false} />,
    );
    const image = wrapper.find('.ranking__item__image');
    expect(image).toHaveLength(0);
  });
});
