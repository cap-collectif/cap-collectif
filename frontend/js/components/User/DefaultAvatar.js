// @flow
import * as React from 'react';

type Props = {
  className: string,
  size: number,
};

export default class DefaultAvatar extends React.Component<Props> {
  static defaultProps = {
    className: 'img-circle avatar mr-10 user-avatar',
    size: 45,
  };

  render() {
    const { className, size } = this.props;
    return (
      <svg
        style={{ boxShadow: '0 0px 5px rgba(0, 0, 0, 0.175)' }}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={`${size}px`}
        height={`${size}px`}
        viewBox="0 0 24 24">
        <defs>
          <style>{`
            .a {
              fill: #fff;
            }
          `}</style>
        </defs>
        <g transform="translate(0)">
          <circle className="a" cx="12" cy="12" r="12" />
          <path
            className="default-avatar-svg"
            d="M-788.14-180.224h0A12,12,0,0,1-791-188a11.921,11.921,0,0,1,3.515-8.485A11.921,11.921,0,0,1-779-200a11.923,11.923,0,0,1,8.486,3.515A11.921,11.921,0,0,1-767-188a12,12,0,0,1-2.859,7.774c-.932-.973-2.924-1.7-5.445-2.631l-.937-.348a.221.221,0,0,1-.142-.2v-1.851a.217.217,0,0,1,.073-.163,3.7,3.7,0,0,0,1.221-2.414.215.215,0,0,1,.062-.133,1.663,1.663,0,0,0,.388-.785,1.991,1.991,0,0,0-.278-1.685.219.219,0,0,1-.033-.22,7.235,7.235,0,0,0,.741-3.719c-.289-1.444-2.328-2.005-3.986-2.047l-.184,0c-1.316,0-2.924.313-3.488,1.192a.219.219,0,0,1-.149.1,1.621,1.621,0,0,0-1.1.631c-.891,1.2.084,3.815.1,3.839a.222.222,0,0,1-.043.2,1.971,1.971,0,0,0-.3,1.706,1.663,1.663,0,0,0,.388.785.21.21,0,0,1,.062.133,3.7,3.7,0,0,0,1.221,2.414.22.22,0,0,1,.074.165v1.851a.218.218,0,0,1-.142.2l-.939.349c-2.517.925-4.506,1.656-5.441,2.629Z"
            transform="translate(791 200)"
          />
        </g>
      </svg>
    );
  }
}
