// @flow
import styled from 'styled-components';

export const CardUser = styled.div`
  padding: 15px 15px 0;

  hr {
    margin: 20px 0 0;
  }

  a {
    color: #707070;
  }

  .ellipsis {
    color: white;
  }

  .card__user__avatar {
    float: left;
    margin-right: 10px;
    width: 45px;
    height: 45px;
    border-radius: 50%;

    img {
      width: 100%;
      object-fit: cover;
      height: 100%;
      border-radius: 50%;
    }
  }
`;

export default CardUser;
