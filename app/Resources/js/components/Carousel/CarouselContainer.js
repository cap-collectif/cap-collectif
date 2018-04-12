import React, { PureComponent } from 'react';
import CarouselMobile from './CarouselMobile';
import CarouselDesktop from './CarouselDesktop';

type Props = {
  highlighteds: Object,
};

export class CarouselContainer extends PureComponent<Props> {
  getCarousel = () => {
    const { highlighteds } = this.props;

    if (window.innerWidth < 992) {
      return <CarouselMobile highlighteds={highlighteds} />;
    }

    return <CarouselDesktop highlighteds={highlighteds} />;
  };

  render() {
    return <div>{this.getCarousel()}</div>;
  }
}

export default CarouselContainer;
