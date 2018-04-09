import React, { PureComponent } from 'react';
import CarouselMobile from "./CarouselMobile";
import CarouselDesktop from "./CarouselDesktop";

type Props = {}

export class CarouselContainer extends PureComponent<Props> {
  getCarousel = () => {
    if(window.innerWidth < 992 ) {
      return (
        <CarouselMobile />
      )
    }

    return (
      <CarouselDesktop />
    )
  };

  render() {

    return(
      <div>
        {this.getCarousel()}
      </div>
    )
  }
}

export default CarouselContainer;
