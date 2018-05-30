// @flow
import React, { PureComponent } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { DatesInterval } from '../Utils/DatesInterval';
import DarkenGradientMedia from '../Ui/DarkenGradientMedia';

type Props = {
  highlighteds: Array<Object>,
};

type State = {
  translateY: number,
};

export class CarouselDesktop extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      translateY: 0,
    };
  }

  componentDidMount() {
    const { highlighteds } = this.props;

    $('#carousel').on('slid.bs.carousel', () => {
      const lastSlide = highlighteds.length - 1;
      const firstSlide = 0;
      const innerCarousel = document.getElementById('carousel-inner');
      const activeContent = innerCarousel && innerCarousel.getElementsByClassName('active');
      const dataOfContent = activeContent && parseInt(activeContent[0].dataset.item, 10);
      const leftArrow = document.getElementById('left-arrow');
      const rightArrow = document.getElementById('right-arrow');

      if (dataOfContent === lastSlide && rightArrow) {
        rightArrow.classList.add('disabled');
      }

      if (dataOfContent === firstSlide && leftArrow) {
        leftArrow.classList.add('disabled');
      }

      if (dataOfContent !== lastSlide && rightArrow) {
        rightArrow.classList.remove('disabled');
      }

      if (dataOfContent !== firstSlide && leftArrow) {
        leftArrow.classList.remove('disabled');
      }
    });
  }

  getEmptyNavItem = () => {
    const { highlighteds } = this.props;
    const emptyItem = [];

    for (let i = 0; i < 4 - highlighteds.length; i++) {
      emptyItem.push(<div key={i} className="empty-item" />);
    }

    return emptyItem;
  };

  render() {
    const { highlighteds } = this.props;

    return (
      <div
        className="carousel__desktop carousel slide"
        id="carousel"
        data-pause="hover"
        data-ride="carousel"
        data-wrap="false"
        data-keyboard="true">
        <div className="carousel__navigation" id="carousel-navigation">
          <ul className="carousel-indicators">
            {highlighteds.map((highlighted, index) => {
              const highlightedType = highlighted.object_type;
              const activeItem = index === 0 ? 'carousel-nav-item active' : 'carousel-nav-item';

              const itemTitle = highlighted[highlightedType].title;
              const maxItemLength = 55;
              const trimmedString =
                itemTitle.length > maxItemLength
                  ? `${itemTitle.substring(0, maxItemLength)}...`
                  : itemTitle;

              return (
                <li
                  key={index}
                  className={activeItem}
                  data-target="#carousel"
                  data-slide-to={index}>
                  <p>
                    <span className="carousel__type">
                      <FormattedMessage id={`type-${highlighted.object_type}`} />
                    </span>
                    <br />
                    <span className="carousel__title">{trimmedString}</span>
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
                </li>
              );
            })}
            {this.getEmptyNavItem()}
            <div id="active-bg-item" />
          </ul>
        </div>
        <div className="carousel__content">
          <div className="sixteen-nine">
            <div className="content">
              <div className="carousel-inner" id="carousel-inner" role="listbox">
                {highlighteds.map((highlighted, index) => {
                  const highlightedType = highlighted.object_type;
                  const activeItem = index === 0 ? 'item active' : 'item';

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
                    <div key={index} className={activeItem} data-item={index}>
                      {getMedia()}
                      <div className="carousel-caption">
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
                            {highlighted[highlightedType].title}
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
              <a
                className="left carousel-control disabled"
                id="left-arrow"
                href="#carousel"
                role="button"
                data-slide="prev">
                <i className="cap-arrow-37" />
                <span className="sr-only">Previous</span>
              </a>
              <a
                className="right carousel-control"
                id="right-arrow"
                href="#carousel"
                role="button"
                data-slide="next">
                <i className="cap-arrow-38" />
                <span className="sr-only">Next</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CarouselDesktop;
