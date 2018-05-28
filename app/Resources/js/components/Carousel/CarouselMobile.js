// @flow
import React, { PureComponent } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { DatesInterval } from '../Utils/DatesInterval';
import DarkenGradientMedia from '../Ui/DarkenGradientMedia';

type Props = {
  highlighteds: Array<Object>,
};

type State = {
  translateX: number,
  windowWidth: number,
};

export class CarouselMobile extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      translateX: 0,
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    const carousel = document.querySelector('.carousel__mobile');

    let isDown = false;
    let startX;

    if (carousel) {
      // touch
      carousel.addEventListener('touchstart', (e: TouchEvent) => {
        isDown = true;
        // $FlowFixMe
        const touchPosition = e.touches && e.touches[0].pageX;
        startX = touchPosition - carousel.offsetLeft;
      });

      // mouse
      carousel.addEventListener('mousedown', (e: MouseEvent) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
      });

      carousel.addEventListener('touchleave', () => {
        isDown = false;
      });

      carousel.addEventListener('mouseleave', () => {
        isDown = false;
      });

      carousel.addEventListener('touchend', () => {
        isDown = false;
      });

      carousel.addEventListener('mouseup', () => {
        isDown = false;
      });

      carousel.addEventListener('touchmove', (e: TouchEvent) => {
        // $FlowFixMe
        const x = e.touches[0].pageX - carousel.offsetLeft;

        this.getTranslateOnMove(x, e, isDown, startX, carousel);
      });

      carousel.addEventListener('mousemove', (e: MouseEvent) => {
        const x = e.pageX - carousel.offsetLeft;

        this.getTranslateOnMove(x, e, isDown, startX, carousel);
      });
    }

    window.addEventListener('resize', () => {
      this.setState({
        windowWidth: window.innerWidth,
      });
    });
  }

  getTranslateOnMove = (x: number, e: Event, isDown: boolean, startX: number, carousel: Object) => {
    const { highlighteds } = this.props;
    const { translateX } = this.state;

    const carouselItem = carousel && carousel.getElementsByClassName('item');
    const carouselTotalWidth =
      carouselItem[0].offsetWidth * // carousel item width
        (highlighteds.length - 1) - // number of item without visible item
      10; // remove padding for last item

    if (!isDown) return;
    e.preventDefault();
    const walk = (x - startX) / 12;

    if (walk + translateX <= 0 && walk + translateX >= -carouselTotalWidth) {
      this.setState({
        translateX: walk + translateX,
      });
    }

    if (walk + translateX > 0) {
      this.setState({
        translateX: 0,
      });
    }

    if (walk + translateX < -carouselTotalWidth) {
      this.setState({
        translateX: -carouselTotalWidth,
      });
    }
  };

  render() {
    const { highlighteds } = this.props;
    const { translateX, windowWidth } = this.state;

    const translation = `translateX(${translateX}px)`;

    return (
      <div className="carousel__mobile">
        <div className="mobile__content" id="mobile-content" style={{ transform: translation }}>
          {highlighteds.map((highlighted, index) => {
            const highlightedType = highlighted.object_type;

            const itemTitle = highlighted[highlightedType].title;
            const maxItemLength = 55;
            const trimmedString =
              itemTitle.length > maxItemLength
                ? `${itemTitle.substring(0, maxItemLength)}...`
                : itemTitle;
            const hadLinearGradient = windowWidth >= 768;

            const getMedia = () => {
              if (highlighted[highlightedType].media) {
                return (
                  <DarkenGradientMedia
                    width="100%"
                    height="100%"
                    linearGradient={hadLinearGradient}
                    url={highlighted[highlightedType].media.url}
                    title={highlighted[highlightedType].title}
                  />
                );
              }

              if (highlighted[highlightedType].cover) {
                return (
                  <DarkenGradientMedia
                    width="100%"
                    height="100%"
                    linearGradient={hadLinearGradient}
                    url={highlighted[highlightedType].cover.url}
                    title={highlighted[highlightedType].title}
                  />
                );
              }

              return <div className="bg--default bg--project" />;
            };

            return (
              <div className="item" key={index}>
                <div className="sixteen-nine">
                  <div className="content">{getMedia()}</div>
                </div>
                <div className="carousel__content">
                  <p>
                    <span className="carousel__type">
                      <FormattedMessage id={`type-${highlighted.object_type}`} />
                    </span>
                    <br />
                    <a
                      className="carousel__title"
                      href={
                        highlighted[highlightedType]._links
                          ? highlighted[highlightedType]._links.show
                          : '#'
                      }>
                      {trimmedString}
                    </a>
                    <br />
                    <span className="carousel__date">
                      {highlightedType === 'event' &&
                        highlighted[highlightedType].startAt &&
                        highlighted[highlightedType].endAt && (
                          <DatesInterval
                            startAt={highlighted[highlightedType].startAt}
                            endAt={highlighted[highlightedType].endAt}
                          />
                        )}
                      {highlightedType === 'project' &&
                        highlighted[highlightedType].startAt && (
                          <FormattedDate
                            value={highlighted[highlightedType].startAt}
                            day="numeric"
                            month="long"
                            year="numeric"
                          />
                        )}
                      {highlightedType === 'idea' &&
                        highlighted[highlightedType].createdAt && (
                          <FormattedDate
                            value={highlighted[highlightedType].createdAt}
                            day="numeric"
                            month="long"
                            year="numeric"
                          />
                        )}
                      {highlightedType === 'post' &&
                        highlighted[highlightedType].publishedAt && (
                          <FormattedDate
                            value={highlighted[highlightedType].publishedAt}
                            day="numeric"
                            month="long"
                            year="numeric"
                          />
                        )}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default CarouselMobile;
