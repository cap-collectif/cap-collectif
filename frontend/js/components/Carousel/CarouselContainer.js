// @flow
import React, { PureComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import CarouselMobile from './CarouselMobile';
import CarouselDesktop from './CarouselDesktop';

export type Props = {
  highlighteds: Array<Object>,
};

type State = {
  windowWidth: number,
};

export class CarouselContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      windowWidth: 0,
    };
  }

  componentDidMount() {
    this.setState({
      windowWidth: window.innerWidth,
    });
  }

  getCarousel = () => {
    const { highlighteds } = this.props;
    const { windowWidth } = this.state;

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });

    if (highlighteds.length !== 0 && windowWidth < 992) {
      return <CarouselMobile highlighteds={highlighteds} />;
    }

    if (highlighteds.length !== 0) {
      return <CarouselDesktop highlighteds={highlighteds} />;
    }

    return (
      <div className="well mb-45">
        <FormattedMessage id="highlighted.empty" />
      </div>
    );
  };

  render() {
    return <div>{this.getCarousel()}</div>;
  }
}

export default CarouselContainer;
