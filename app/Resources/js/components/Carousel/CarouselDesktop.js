import React, { PureComponent } from 'react';

type Props = {}

export class CarouselDesktop extends PureComponent<Props> {
  render() {

    return(
      <div className="carousel__desktop carousel slide" id="carousel" data-ride="carousel" data-pause="hover" data-wrap="false">
        <div className="carousel__navigation">
          <ul className="">
            <li data-target="#carousel" data-slide-to="0" className="active">
              <p><span className="carousel-type">Article</span><br/>
                <span className="carousel-title">10ème arrondissement: quels changement à anticiper ?</span><br/>
              <i>18 janvier 2018</i></p>
            </li>
            <li data-target="#carousel" data-slide-to="1">
              <p><span className="carousel-type">Projet</span><br/>
                <span className="carousel-title">Parcs et jardins: Nouveau règlement des parcs, jardin</span><br/>
              <i>Du 10 janvier 2018 au 2 mai 2018</i></p>
            </li>
            <li data-target="#carousel" data-slide-to="2">
              <p><span className="carousel-type">Idée</span><br/>
                <span className="carousel-title">Faune à Paris: Favorisons la biodiversité animale</span><br/>
              <i>5 janvier 2018</i></p>
            </li>
            <li data-target="#carousel" data-slide-to="3">
              <p><span className="carousel-type">Evènement</span><br/>
              <span className="carousel-title">Paris Plage 2018: du nouveau ! Paris Plage</span><br/>
              <i>Du 2 juin 2018 au 2 septembre 2018</i></p>
            </li>
          </ul>

        </div>
        <div className="carousel__content">
          <div className="sixteen-nine">
            <div className="content">

              <div className="carousel-inner" role="listbox">
                <div className="item active">
                  <img src="https://images.unsplash.com/photo-1505728068082-c4e7a2a3a46d?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eec4bf8bd0cde39ebd993ff9d89398dd&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
                  <div className="carousel-caption">
                    <p>mon premier item</p>
                  </div>
                </div>
                <div className="item">
                  <img src="https://images.unsplash.com/photo-1504899011678-594a2d24ac33?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=dda7f8407f2fa0d53076f38bc7420652&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
                  <div className="carousel-caption">
                    <p>mon deuxième item</p>
                    <h3></h3>
                  </div>
                </div>
                <div className="item">
                  <img src="https://images.unsplash.com/photo-1514064019862-23e2a332a6a6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=87ffb8e2ae58c967f051b396c7faca63&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
                  <div className="carousel-caption">
                    <p>mon troisième item</p>
                  </div>
                </div>
                <div className="item">
                  <img src="https://images.unsplash.com/photo-1488763882255-3c188b9ff4d2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=909cbe60201d92c00f3a52de876b05d3&dpr=1&auto=format&fit=crop&q=80&cs=tinysrgb" alt="..." />
                  <div className="carousel-caption">
                    <p>mon quatrième item</p>
                  </div>
                </div>
              </div>
              
              <a className="left carousel-control" href="#carousel" role="button" data-slide="prev">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                <span className="sr-only">Previous</span>
              </a>
              <a className="right carousel-control" href="#carousel" role="button" data-slide="next">
                <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                <span className="sr-only">Next</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CarouselDesktop;
