// @flow
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const ProjectAnalysisPreviewContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'project-analysis-preview',
})`
  width: 100%;
  height: 80px;

  .card {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .card__body {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    & > div {
      overflow: hidden;
      margin-right: 30px;

      p {
        margin: 0;
        font-size: 16px;
      }
    }
  }

  .card__cover {
    min-width: 120px;
    max-width: 120px;
  }

  .card__title {
    font-weight: normal;
    margin-bottom: 5px;

    a {
      display: block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .inline-list {
    li {
      color: #6c757d;
      margin-right: 14px;

      &:last-of-type {
        margin-right: 0;
      }

      & > span {
        vertical-align: middle;
      }
    }

    .icon {
      fill: #6c757d;
      margin-right: 5px;
    }
  }
`;

export const DefaultCoverPreview: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'default-cover',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${colors.secondGray};
`;

export default ProjectAnalysisPreviewContainer;
