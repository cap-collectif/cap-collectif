import React, { PureComponent } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { DatesInterval } from '../Utils/DatesInterval';
import DarkenGradientMedia from '../Ui/DarkenGradientMedia';

type Props = {
  highlighteds: Object,
  translateX: number,
};

export class CarouselMobile extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      translateX: 0,
    };
  }

  componentDidMount() {
    const { highlighteds } = this.props;
    const carousel = document.querySelector('.carousel__mobile');

    let isDown = false;
    let startX;

    carousel.addEventListener('touchstart', e => {
      isDown = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
    });

    carousel.addEventListener('touchleave', () => {
      isDown = false;
    });

    carousel.addEventListener('touchend', () => {
      isDown = false;
    });

    carousel.addEventListener('touchmove', e => {
      const { translateX } = this.state;
      const carouselItem = carousel.getElementsByClassName('item');
      const carouselTotalWidth =
        carouselItem[0].offsetWidth * // carousel item width
          (highlighteds.length - 1) - // number of item without visible item
        10; // remove padding for last item

      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) / 5;

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
    });
  }

  render() {
    const { highlighteds } = this.props;
    const { translateX } = this.state;

    const translation = `translateX(${translateX}px)`;

    return (
      <div className="carousel__mobile">
        <div className="mobile__content" style={{ transform: translation }}>
          {highlighteds.map((highlighted, index) => {
            const highlightedType = highlighted.object_type;

            const itemTitle = highlighted[highlightedType].title;
            const maxItemLength = 55;
            const trimmedString =
              itemTitle.length > maxItemLength
                ? `${itemTitle.substring(0, maxItemLength)}...`
                : itemTitle;

            const getMedia = () => {
              if (highlighted[highlightedType].media) {
                return (
                  <DarkenGradientMedia
                    width="100%"
                    height="100%"
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
                    <span className="carousel-type">
                      <FormattedMessage id={`type-${highlighted.object_type}`} />
                    </span>
                    <br />
                    <a
                      className="carousel-title"
                      href={
                        highlighted[highlightedType]._links
                          ? highlighted[highlightedType]._links.show
                          : '#'
                      }>
                      {trimmedString}
                    </a>
                    <br />
                    <span className="carousel-date">
                      {highlightedType === 'event' && (
                        <DatesInterval
                          startAt={highlighted[highlightedType].startAt}
                          endAt={highlighted[highlightedType].endAt}
                        />
                      )}
                      {highlightedType === 'project' && (
                        <FormattedDate
                          value={highlighted[highlightedType].startAt}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      )}
                      {highlightedType === 'idea' && (
                        <FormattedDate
                          value={highlighted[highlightedType].createdAt}
                          day="numeric"
                          month="long"
                          year="numeric"
                        />
                      )}
                      {highlightedType === 'post' && (
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
