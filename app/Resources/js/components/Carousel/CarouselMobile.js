import React, { PureComponent } from 'react';
import {FormattedDate, FormattedMessage} from "react-intl";
import {DatesInterval} from "../Utils/DatesInterval";

type Props = {
  highlighteds: Object,
};

export class CarouselMobile extends PureComponent<Props> {
  componentDidMount() {
    const carousel = document.querySelector('.carousel__mobile');
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('touchstart', e => {
      isDown = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('touchleave', () => {
      isDown = false;
    });

    carousel.addEventListener('touchend', () => {
      isDown = false;
    });

    carousel.addEventListener('touchmove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 3;
      carousel.scrollLeft = scrollLeft - walk;
    });
  }

  render() {
    const { highlighteds } = this.props;

    return (
      <div className="carousel__mobile">
        <div className="mobile__content">
          {highlighteds.map((highlighted, index) => {
            const highlightedType = highlighted.object_type;

            return (
              <div className="item" key={index}>
                <div className="sixteen-nine">
                  <div className="content">
                    {highlighted[highlightedType].media ?
                      (<img
                          src={highlighted[highlightedType].media.url}
                          alt={highlighted[highlightedType].title}
                        />)
                      :
                      (<div className="bg--default bg--project" />)
                    }

                  </div>
                </div>
                <div className="carousel__content">
                  <p>
                    <span className="carousel-type">
                      <FormattedMessage id={`type-${highlighted.object_type}`} />
                    </span>
                    <br />
                    <a className="carousel-title" href={highlighted[highlightedType]._links ? highlighted[highlightedType]._links.show : '#'}>
                      {highlighted[highlightedType].title}
                    </a>
                    <br />
                    <span className="carousel-date">
                      { highlightedType === 'event' &&
                        <DatesInterval startAt={highlighted[highlightedType].startAt} endAt={highlighted[highlightedType].endAt} />
                      }
                      { highlightedType === 'project' &&
                        <FormattedDate value={highlighted[highlightedType].startAt} day="numeric" month="long" year="numeric" />
                      }
                      { highlightedType === 'idea' &&
                        <FormattedDate value={highlighted[highlightedType].createdAt} day="numeric" month="long" year="numeric" />
                      }
                      { highlightedType === 'post' &&
                        <FormattedDate value={highlighted[highlightedType].publishedAt} day="numeric" month="long" year="numeric" />
                      }
                    </span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

export default CarouselMobile;
