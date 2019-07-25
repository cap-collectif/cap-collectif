// @flow
import * as React from 'react';
import styled from 'styled-components';

type Props = {|
  +video: Object,
|};

const PLAY_RATIO = 6;

const VideoThumbnail = styled.div`
  position: relative;
  width: auto;
  height: auto;
`;

const PlayButton = styled.a`
  position: absolute;
  top: 50%;
  left: 50%;
`;

const PlayButtonCircle = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 1000;
  transform: translateX(-50%) translateY(-50%);
  display: block;
  border-radius: 50%;
  border: 4px solid white;
  background-color: rgba(0, 0, 0, 0.4);
`;

const PlayButtonTriangle = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 1000;
  transform: translateX(-45%) translateY(-50%) scale(0.5);
  display: block;
  content: '';
`;

export const Video = (props: Props) => {
  const { video } = props;

  // Resizing the play button
  const thumbnail = React.useRef<?HTMLDivElement>(null);
  const [thumbnailWidth, setThumbnailWidth] = React.useState(0);
  React.useEffect(() => {
    if (thumbnail.current) {
      setThumbnailWidth(thumbnail.current.offsetWidth / PLAY_RATIO);
    }
  }, []);
  React.useEffect(() => {
    const onResize = () => {
      if (thumbnail.current) {
        setThumbnailWidth(thumbnail.current.offsetWidth / PLAY_RATIO);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [thumbnailWidth]);

  return (
    <div className="video">
      <VideoThumbnail video={video} ref={thumbnail}>
        {video.media ? (
          <React.Fragment>
            <img
              title={video.media.name}
              className="img-responsive"
              src={video.media.thumbnailLink}
              alt={video.media.name}
              data-type="iframe"
            />
            <PlayButton href={video.link}>
              <PlayButtonCircle
                style={{ width: `${thumbnailWidth}px`, height: `${thumbnailWidth}px` }}
              />
              <PlayButtonTriangle
                style={{
                  borderTop: `${thumbnailWidth / 2}px solid transparent`,
                  borderLeft: `${thumbnailWidth}px solid white`,
                  borderBottom: `${thumbnailWidth / 2}px solid transparent`,
                }}
              />
            </PlayButton>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="bg-default  bg--video" />
            <PlayButton href={video.link} data-type="iframe">
              <PlayButtonCircle
                style={{ width: `${thumbnailWidth}px`, height: `${thumbnailWidth}px` }}
              />
              <PlayButtonTriangle
                style={{
                  borderTop: `${thumbnailWidth / 2}px solid transparent`,
                  borderLeft: `${thumbnailWidth}px solid white`,
                  borderBottom: `${thumbnailWidth / 2}px solid transparent`,
                }}
              />
            </PlayButton>
          </React.Fragment>
        )}
      </VideoThumbnail>
      <div className="video-description">
        <h3 className="video-title">{video.title}</h3>
        <p>{video.body}</p>
      </div>
    </div>
  );
};
