// @flow
import * as React from 'react';
import styled from 'styled-components';
import Progress from './Progress';

export const Excerpt = styled.span`
  font-size: 14px;
  color: #707070;
  
  span {
    color: #212529;
  }
  
  a {
    color: #707070;
  }
`;

export class Font extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <div>
        <h4>H1</h4>
        <h1>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </h1>
        <hr/>
        <h4>H2</h4>
        <h2>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </h2>
        <hr/>
        <h4>H3</h4>
        <h3>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </h3>
        <hr/>
        <h4>H4</h4>
        <h4>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </h4>
        <hr/>
        <h4>Basic text</h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias aperiam dolore eligendi labore, nemo quidem veniam. Delectus est, similique! Aliquam aliquid assumenda commodi laborum natus quidem ratione repudiandae vel voluptates.
        </p>
        <hr/>
        <h4>Excerpt</h4>
        <p>
          <Excerpt>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam asperiores at, eaque fugiat ipsam, laudantium molestiae omnis quas quasi quidem reprehenderit repudiandae velit! Atque deserunt earum eligendi quae quod sequi.
          </Excerpt>
        </p>
        <hr/>
        <h4>Bold text</h4>
        <p>
          <b>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum dolore perspiciatis quas sunt. Aut eveniet, fugit qui sunt temporibus veniam voluptates! Dicta eius iusto laudantium magni mollitia tempore temporibus veritatis!
          </b>
        </p>
        <hr/>
        <h4>Italic text</h4>
        <p>
          <i>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque corporis doloremque ex expedita impedit in inventore, maxime modi officia quam quibusdam quis reprehenderit rerum, sit vitae! Consectetur magni sint voluptate.
          </i>
        </p>
        <hr/>
        <h4>Link</h4>
        <p>
          <a href="#">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque corporis doloremque ex expedita impedit in inventore, maxime modi officia quam quibusdam quis reprehenderit rerum, sit vitae! Consectetur magni sint voluptate.
          </a>
        </p>
      </div>
    );
  }
}
