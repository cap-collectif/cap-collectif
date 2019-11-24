// @flow
import { type ComponentType } from 'react';
import styled from 'styled-components';

export const EditorArea: ComponentType<{}> = styled('div')`
  /* don't put position relative for floating dialog */
  /* position: relative; */
  background-color: white;
  padding: 30px 20px;
  width: 100%;
  cursor: text;
  /* overflow-y: scroll;*/
  text-align: left; /* force default left by default */

  /* remove default margin & padding */
  figure {
    margin: 0;
    padding: 0;
  }

  img {
    max-width: 100%;
  }

  blockquote {
    border-left: 2px solid rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
    font-size: 22px;
    font-weight: 600;
    text-align: left;
    padding: 5px 15px;
  }

  .block-align-left {
    text-align: left;
  }
  .block-align-center {
    text-align: center;
  }
  .block-align-right {
    text-align: right;
  }
`;
