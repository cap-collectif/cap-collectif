// @flow
import React, { PureComponent } from 'react';
import CarouselMobile from './CarouselMobile';
import CarouselDesktop from './CarouselDesktop';

type Props = {
  highlighteds: Array<Object>,
};

type State = {
  windowWidth: number,
};

export class CarouselContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
    };
  }

  getCarousel = () => {
    const { highlighteds } = this.props;
    const { windowWidth } = this.state;

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });

    if (windowWidth < 992) {
      return <CarouselMobile highlighteds={highlighteds} />;
    }

    return <CarouselDesktop highlighteds={highlighteds} />;
  };

  render() {
    return <div>{this.getCarousel()}</div>;
  }
}

export default CarouselContainer;
