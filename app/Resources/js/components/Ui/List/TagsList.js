// @flow
import styled from 'styled-components';

const TagsList = styled.div.attrs({
  className: 'ellipsis',
})`
  font-size: 14px;

  .tags-list__tag {
    padding: 5px 0 0 5px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:first-child {
      padding: 0 0 0 5px;
    }

    .cap {
      padding-right: 5px;
    }

    button {
      padding: 0;
      margin: 0;
      color: inherit;

      &:hover {
        text-decoration: none;
        color: inherit;
        cursor: pointer;
      }
    }
  }

  a.tags-list__tag {
    &:not(:hover) {
      color: inherit;
    }

    &:hover {
      text-decoration: none;
      cursor: pointer;
    }
  }
`;

export default TagsList;
