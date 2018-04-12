import React, { PureComponent } from 'react';

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

  getCarouselItem = () => {
    const { highlighteds } = this.props;

    highlighteds.map((highlighted, index) => {
      return (
        <li key={index}>coucou</li>
      )
    })
  };

  render() {
    const { highlighteds } = this.props;

    // console.log(highlighteds);

    return (
      <div className="carousel__mobile">
        <div className="mobile__content">
          {highlighteds.map((highlighted, index) => {
            const highlightedType = highlighted.object_type;

            console.warn(highlighted[highlightedType]);

            return (
              <div className="item" key={index}>
                <div className="sixteen-nine">
                  <div className="content">
                    <img
                      src="https://images.unsplash.com/photo-1505728068082-c4e7a2a3a46d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eec4bf8bd0cde39ebd993ff9d89398dd&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb"
                      alt="..."
                    />
                  </div>
                </div>
                <div className="carousel__content">
                  <p>
                    <span className="carousel-type">{highlighted.object_type}</span>
                    <br />
                    <span className="carousel-title">
                       {highlighted.object_type === 'post' ? (
                         highlighted.media
                       ) : (
                         highlighted[highlightedType].title
                       )}
                    </span>
                    <br />
                    <span className="carousel-date">18 janvier 2018</span>
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
