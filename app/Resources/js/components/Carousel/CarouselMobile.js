import React, { PureComponent } from 'react';

type Props = {}

export class CarouselMobile extends PureComponent<Props> {

  ComponentDidMount() {
    const carousel = document.querySelector('.carousel__mobile');
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', () => {
      isDown = true;
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
    });

    carousel.addEventListener('mousemove', () => {
      console.log(isDown);
      console.log('Do work')
    });
  }

  render() {
    return(
      <div className="carousel__mobile">
        <div className="item">
          <div className="sixteen-nine">
            <div className="content">
              <img src="https://images.unsplash.com/photo-1505728068082-c4e7a2a3a46d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eec4bf8bd0cde39ebd993ff9d89398dd&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
            </div>
          </div>
          <div className="carousel__content">
            <p>
              <span className="carousel-type">Article</span><br/>
              <span className="carousel-title">10ème arrondissement: quels changement à anticiper ?</span><br/>
              <span className="carousel-date" >18 janvier 2018</span>
            </p>
          </div>
        </div>
        <div className="item">
          <div className="sixteen-nine">
            <div className="content">
              <img src="https://images.unsplash.com/photo-1504899011678-594a2d24ac33?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=dda7f8407f2fa0d53076f38bc7420652&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
            </div>
          </div>
          <div className="carousel__content">
            <p>
              <span className="carousel-type">Projet</span><br/>
              <span className="carousel-title">Parcs et jardins: Nouveau règlement des parcs, jardin</span><br/>
              <span className="carousel-date" >Du 10 janvier 2018 au 2 mai 2018</span>
            </p>
          </div>
        </div>
        <div className="item">
          <div className="sixteen-nine">
            <div className="content">
              <img src="https://images.unsplash.com/photo-1514064019862-23e2a332a6a6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=87ffb8e2ae58c967f051b396c7faca63&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
            </div>
          </div>
          <div className="carousel__content">
            <p>
              <span className="carousel-type">Idée</span><br/>
              <span className="carousel-title">Faune à Paris: Favorisons la biodiversité animale</span><br/>
              <span className="carousel-date" >5 janvier 2018</span>
            </p>
          </div>
        </div>
        <div className="item">
          <div className="sixteen-nine">
            <div className="content">
              <img src="https://images.unsplash.com/photo-1488763882255-3c188b9ff4d2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=909cbe60201d92c00f3a52de876b05d3&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
            </div>
          </div>
          <div className="carousel__content">
            <p>
              <span className="carousel-type">Evènement</span><br/>
              <span className="carousel-title">Paris Plage 2018: du nouveau ! Paris Plage balbalbal udegiugdfugierfriue</span><br/>
              <span className="carousel-date">Du 2 juin 2018 au 2 septembre 2018</span>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default CarouselMobile;
