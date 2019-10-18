// @flow
import styled from 'styled-components';

export const EditorArea = styled.div`
  position: relative;
  background-color: white;
  padding: 20px;
  width: 100%;
  height: 100%;
  cursor: text;
  overflow-y: scroll;
  text-align: left; /* force default left by default */

  figure {
    margin: 0;
    padding: 0;
  }

  blockquote {
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    padding: 15px 0;
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
