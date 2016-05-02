/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
  connectDragSource: (cp) => { return cp;},
  arrowFunctions: arrowFunctions,
};

const OriginalComponent = RankingItem.DecoratedComponent;

describe('<RankingItem />', () => {
  it('should render ranking item', () => {
    const wrapper = shallow(<OriginalComponent {...props} item={item} disabled={false} isDragging={false} />);
    const container = wrapper.find('.ranking__item');
    expect(container).to.have.lengthOf(1);
    expect(container.prop('style').opacity).to.equal(1);
    expect(container.hasClass('list-group-item')).to.equal(true);
    expect(container.hasClass('disabled')).to.equal(false);
    expect(wrapper.find('.ranking__item__icon')).to.have.lengthOf(1);
    expect(wrapper.find('i.cap.cap-cursor-move')).to.have.lengthOf(1);
    const label = wrapper.find('.ranking__item__label');
    expect(label).to.have.lengthOf(1);
    expect(label.text()).to.equal('Choix 1');
    const arrows = wrapper.find('RankingArrows');
    expect(arrows).to.have.lengthOf(1);
    expect(arrows.prop('item')).to.equal(item);
    expect(arrows.prop('arrowFunctions')).to.equal(arrowFunctions);
    expect(arrows.prop('disabled')).to.equal(false);
    const description = wrapper.find('.ranking__item__description');
    expect(description).to.have.lengthOf(1);
    expect(description.text()).to.equal('Description');
    const image = wrapper.find('.ranking__item__image');
    expect(image).to.have.lengthOf(1);
    expect(image.prop('src')).to.equal('test.png');
  });

  it('should render transparent item when dragged', () => {
    const wrapper = shallow(<OriginalComponent {...props} item={item} disabled={false} isDragging />);
    const container = wrapper.find('.ranking__item');
    expect(container).to.have.lengthOf(1);
    expect(container.prop('style').opacity).to.equal(0.5);
  });

  it('should render disabled item when required', () => {
    const wrapper = shallow(<OriginalComponent {...props} item={item} disabled isDragging={false} />);
    const container = wrapper.find('.ranking__item');
    expect(container).to.have.lengthOf(1);
    expect(container.hasClass('disabled')).to.equal(true);
    const arrows = wrapper.find('RankingArrows');
    expect(arrows).to.have.lengthOf(1);
    expect(arrows.prop('disabled')).to.equal(true);
  });

  it('should render no description when item has not', () => {
    const wrapper = shallow(<OriginalComponent {...props} item={itemWithoutDescription} disabled={false} isDragging={false} />);
    const description = wrapper.find('.ranking__item__description');
    expect(description).to.have.lengthOf(0);
  });

  it('should render no image when item has not', () => {
    const wrapper = shallow(<OriginalComponent {...props} item={itemWithoutImage} disabled={false} isDragging={false} />);
    const image = wrapper.find('.ranking__item__image');
    expect(image).to.have.lengthOf(0);
  });
});
