// @flow
import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { type IntlShape, useIntl } from 'react-intl';
import styled, { type StyledComponent, css } from 'styled-components';

type Tag = {| value: string, count: number |};

type Props = {|
  tags: Array<Tag>,
  maxSize: number,
  minSize: number,
|};

const Container: StyledComponent<{ isHover: boolean }, {}, HTMLDivElement> = styled.div`
  text-align: center;
  font-family: OpenSans, helvetica, arial, sans-serif;
  font-weight: 600;
  ${({ isHover }) =>
    isHover &&
    css`
      span:not(:hover) {
        opacity: 0.5;
      }
    `}
`;

const getColor = (size: number) => {
  if (size > 40) return '#1A88FF';
  if (size > 24) return '#006CE0';
  if (size > 16) return '#0051A8';
  return '#003670';
};

const fontSizeConverter = (count, min, max, minSize, maxSize) => {
  if (max - min === 0) {
    return Math.round((minSize + maxSize) / 2);
  }
  return Math.round(((count - min) * (maxSize - minSize)) / (max - min) + minSize);
};

const styles = {
  margin: '5px',
  verticalAlign: 'middle',
  display: 'inline-block',
};

const renderer = (tag: Tag, size: number, intl: IntlShape, setIsHover, marginBottom) => {
  const fontSize = `${size}px`;
  const color = getColor(size);
  const style = { ...styles, color, fontSize };
  return (
    <OverlayTrigger
      key={`info-occurences-${tag.value}`}
      placement="top"
      style={{ marginBottom }}
      overlay={
        <Tooltip id={`info-occurences-tooltip-${tag.value}`}>
          {intl.formatMessage({ id: 'appearances-count' }, { num: tag.count })}
        </Tooltip>
      }>
      <span
        style={{ ...style, marginBottom }}
        key={tag.value}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}>
        {tag.value}
      </span>
    </OverlayTrigger>
  );
};

const renderTags = (props, data, intl, setIsHover) => {
  const { minSize, maxSize } = props;
  const counts = data.map(({ tag }: { tag: Tag }) => tag.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return data.map(({ tag, marginBottom }: { tag: Tag, marginBottom: number }) => {
    const fontSize = fontSizeConverter(tag.count, min, max, minSize, maxSize);
    return renderer(tag, fontSize, intl, setIsHover, marginBottom);
  });
};

const randomize = (tags: Array<Tag>) => {
  const data = tags.map(tag => ({
    tag,
    marginBottom: -1 * Math.floor(Math.random() * 25),
  }));
  return data.sort(() => Math.random() - 0.5);
};

export const TagCloud = (props: Props) => {
  const { tags } = props;
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [isHover, setIsHover] = useState(false);
  const tagsComparison = tags.map(t => t.value).join(':');
  useEffect(() => {
    setData(randomize(tags));
  }, [tags, tagsComparison]);
  return <Container isHover={isHover}>{renderTags(props, data, intl, setIsHover)}</Container>;
};

export default TagCloud;
