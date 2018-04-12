import React, { PureComponent } from 'react';

type Props = {};

export class CarouselDesktop extends PureComponent<Props> {
  componentDidMount() {
    $('#carousel').on('slid.bs.carousel', () => {
      const lastSlide = 3;
      const firstSlide = 0;
      const innerCarousel = document.getElementById('carousel-inner');
      const activeContent = innerCarousel.getElementsByClassName('active');
      const dataOfContent = parseInt(activeContent[0].dataset.item, 10);
      const leftArrow = document.getElementById('left-arrow');
      const rightArrow = document.getElementById('right-arrow');

      console.log(dataOfContent === lastSlide);

      if (dataOfContent === lastSlide) {
        rightArrow.classList.add('disabled');
      }

      if (dataOfContent === firstSlide) {
        leftArrow.classList.add('disabled');
      }

      if (dataOfContent !== lastSlide) {
        rightArrow.classList.remove('disabled');
      }

      if (dataOfContent !== firstSlide) {
        leftArrow.classList.remove('disabled');
      }
    });

    // navCarousel.addEventListener('mousedown', (ev) => {
    //   const activeItem =  navCarousel.getElementsByClassName('active');
    //   const activeItemTop = activeItem[0].getBoundingClientRect();
    //
    //   if(activeItemTop) { // mouse top < activeitemTop
    //     // add top-transition
    //   }
    //
    //   // remove top-transition
    // });

    // leftArrow[0].addEventListener('click', () => {
    //   // add top-transition
    // });
  }

  getCarouselContent = () => {};

  getEmptyNavItem = () => {
    // for(i = 0, i < (4 - project.lenght), i++) { return ( <div className="empty-item" /> )}
  };

  getCarouselNavigation = () => {
    // map project
    // {project.lenght < 4 && this.getEmptyNavItem()}
  };

  render() {
    return (
      <div className="container">
        <div
          className="carousel__desktop carousel slide"
          id="carousel"
          data-ride="carousel"
          data-pause="hover"
          data-wrap="false"
          data-keyboard="true">
          <div className="carousel__navigation" id="carousel-navigation">
            <ul className="carousel-indicators">
              <li className="carousel-nav-item active" data-target="#carousel" data-slide-to="0">
                <p>
                  <span className="carousel-type">Article</span>
                  <br />
                  <span className="carousel-title">
                    10ème arrondissement: quels changement à anticiper ?
                  </span>
                  <br />
                  <i>18 janvier 2018</i>
                </p>
              </li>
              <li className="carousel-nav-item" data-target="#carousel" data-slide-to="1">
                <p>
                  <span className="carousel-type">Projet</span>
                  <br />
                  <span className="carousel-title">
                    Parcs et jardins: Nouveau règlement des parcs, jardin
                  </span>
                  <br />
                  <i>Du 10 janvier 2018 au 2 mai 2018</i>
                </p>
              </li>
              <li className="carousel-nav-item" data-target="#carousel" data-slide-to="2">
                <p>
                  <span className="carousel-type">Idée</span>
                  <br />
                  <span className="carousel-title">
                    Faune à Paris: Favorisons la biodiversité animale
                  </span>
                  <br />
                  <i>5 janvier 2018</i>
                </p>
              </li>
              <li className="carousel-nav-item" data-target="#carousel" data-slide-to="3">
                <p>
                  <span className="carousel-type">Evènement</span>
                  <br />
                  <span className="carousel-title">Paris Plage 2018: du nouveau ! Paris Plage</span>
                  <br />
                  <i>Du 2 juin 2018 au 2 septembre 2018</i>
                </p>
              </li>
            </ul>
          </div>
          <div className="carousel__content">
            <div className="sixteen-nine">
              <div className="content">
                <div className="carousel-inner" id="carousel-inner" role="listbox">
                  <div className="item active" data-item="0">
                    <img
                      src="https://images.unsplash.com/photo-1505728068082-c4e7a2a3a46d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eec4bf8bd0cde39ebd993ff9d89398dd&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb"
                      alt="..."
                    />
                    <div className="carousel-caption">
                      <p>
                        <span className="carousel-type">Article</span>
                        <br />
                        <span className="carousel-title">
                          10ème arrondissement: quels changement à anticiper ?
                        </span>
                        <br />
                        <span className="carousel-date">18 janvier 2018</span>
                      </p>
                    </div>
                  </div>
                  <div className="item" data-item="1">
                    <img
                      src="https://images.unsplash.com/photo-1504899011678-594a2d24ac33?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=dda7f8407f2fa0d53076f38bc7420652&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb"
                      alt="..."
                    />
                    <div className="carousel-caption">
                      <p>
                        <span className="carousel-type">Projet</span>
                        <br />
                        <span className="carousel-title">
                          Parcs et jardins: Nouveau règlement des parcs, jardin
                        </span>
                        <br />
                        <span className="carousel-date">Du 10 janvier 2018 au 2 mai 2018</span>
                      </p>
                    </div>
                  </div>
                  <div className="item" data-item="2">
                    <img
                      src="https://images.unsplash.com/photo-1514064019862-23e2a332a6a6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=87ffb8e2ae58c967f051b396c7faca63&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb"
                      alt="..."
                    />
                    <div className="carousel-caption">
                      <p>
                        <span className="carousel-type">Idée</span>
                        <br />
                        <span className="carousel-title">
                          Faune à Paris: Favorisons la biodiversité animale
                        </span>
                        <br />
                        <span className="carousel-date">5 janvier 2018</span>
                      </p>
                    </div>
                  </div>
                  <div className="item" data-item="3">
                    <img
                      src="https://images.unsplash.com/photo-1488763882255-3c188b9ff4d2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=909cbe60201d92c00f3a52de876b05d3&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb"
                      alt="..."
                    />
                    <div className="carousel-caption">
                      <p>
                        <span className="carousel-type">Evènement</span>
                        <br />
                        <span className="carousel-title">
                          Paris Plage 2018: du nouveau ! Paris Plage balbalbal udegiugdfugierfriue
                        </span>
                        <br />
                        <span className="carousel-date">Du 2 juin 2018 au 2 septembre 2018</span>
                      </p>
                    </div>
                  </div>
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
      </div>
    );
  }
}

export default CarouselDesktop;
