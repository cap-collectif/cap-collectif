// @flow
import React, { PureComponent } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { DatesInterval } from '../Utils/DatesInterval';
import DarkenGradientMedia from '../Ui/Medias/DarkenGradientMedia';
import SixteenNineMedia from '../Ui/Medias/SixteenNineMedia';

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

    // $FlowFixMe
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

  getItemDate = (type: string, item: Object) => (
    <span className="carousel__date">
      {type === 'event' && item.startAt && item.endAt && (
        <DatesInterval startAt={item.startAt} endAt={item.endAt} />
      )}
      {type === 'project' && item.startAt && (
        <FormattedDate
          value={moment(item.startAt).toDate()}
          day="numeric"
          month="long"
          year="numeric"
        />
      )}
      {type === 'idea' && item.createdAt && (
        <FormattedDate
          value={moment(item.createdAt).toDate()}
          day="numeric"
          month="long"
          year="numeric"
        />
      )}
      {type === 'post' && item.publishedAt && (
        <FormattedDate
          value={moment(item.publishedAt).toDate()}
          day="numeric"
          month="long"
          year="numeric"
        />
      )}
    </span>
  );

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

              const item = highlighted[highlightedType];

              const maxItemLength = 55;
              const trimmedString =
                item.title.length > maxItemLength
                  ? `${item.title.substring(0, maxItemLength)}...`
                  : item.title;

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
                    {this.getItemDate(highlightedType, item)}
                  </p>
                </li>
              );
            })}
            {this.getEmptyNavItem()}
            <div id="active-bg-item" />
          </ul>
        </div>
        <div className="carousel__content">
          <SixteenNineMedia>
            <div className="carousel-inner" id="carousel-inner" role="listbox">
              {highlighteds.map((highlighted, index) => {
                const highlightedType = highlighted.object_type;
                const activeItem = index === 0 ? 'item active' : 'item';
                const item = highlighted[highlightedType];

                const getMedia = () => {
                  if (item.media) {
                    return (
                      <DarkenGradientMedia
                        width="100%"
                        height="100%"
                        url={item.media.url}
                        title={item.title}
                      />
                    );
                  }

                  if (item.cover) {
                    return (
                      <DarkenGradientMedia
                        width="100%"
                        height="100%"
                        url={item.cover.url}
                        title={item.title}
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
                        <a className="carousel__title" href={item._links ? item._links.show : '#'}>
                          {item.title}
                        </a>
                        <br />
                        {this.getItemDate(highlightedType, item)}
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
          </SixteenNineMedia>
        </div>
      </div>
    );
  }
}

export default CarouselDesktop;
