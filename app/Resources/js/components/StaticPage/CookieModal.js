// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import Cookie from './Cookie';
import CookieMonster from '../../CookieMonster';
import type { State } from '../../types';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
  bannerTrad: string,
  cookieTrad?: ?string,
  isLink: boolean,
  withListSeparator: boolean,
};

type CookieModalState = {
  showModal: boolean,
};

export class CookieModal extends React.Component<Props, CookieModalState> {
  static defaultProps = {
    isLink: false,
    withListSeparator: false,
  };

  cookie: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.cookie = React.createRef();
  }

  componentDidMount() {
    if (this.props.isLink === true) {
      window.addEventListener('hashchange', this.changeShowModalState, false);
    }
  }

  componentWillUnmount() {
    if (this.props.isLink === true) {
      window.removeEventListener('hashchange', this.changeShowModalState, false);
    }
  }

  changeShowModalState = () => {
    const hash = window.location.href.split('#');
    if (
      Array.isArray(hash) &&
      hash[1] !== null &&
      typeof hash[1] !== 'undefined' &&
      hash[1] === 'cookiesManagement' &&
      this.state.showModal === false
    ) {
      this.setState({ showModal: true });
      const noHashURL = window.location.href.replace(/#.*$/, '');
      window.history.replaceState('', document.title, noHashURL);
    }
  };

  saveCookie = () => {
    this.cookie.current.saveCookiesConfiguration();
    this.setState({ showModal: false });
  };

  render() {
    const { isLink, analyticsJs, adJs, bannerTrad, cookieTrad, withListSeparator } = this.props;
    const { showModal } = this.state;
    return (
      <div className="cookie-manager">
        {isLink ? (
          <div>
            {withListSeparator && <span>| </span>}
            <Button
              variant="link"
              bsStyle="link"
              className="p-0"
              id="cookies-management"
              onClick={() => {
                this.setState({ showModal: true });
              }}>
              <FormattedMessage id={cookieTrad || 'cookies-management'} />
            </Button>
          </div>
        ) : (
          <div id="cookie-banner" className="cookie-banner">
            <div className="col-sm-9">
              <FormattedMessage id={bannerTrad} />
            </div>
            <div className="col-sm-3 text-right">
              <Button
                id="cookie-more-button"
                className="mr-10 mt-10"
                variant="link"
                bsStyle="link"
                onClick={() => {
                  this.setState({ showModal: true });
                }}
                name="cookie-more">
                <FormattedMessage id="cookies-setting" />
              </Button>
              <Button
                id="cookie-consent"
                bsStyle="default"
                className="btn btn-default btn-sm mt-10"
                onClick={() => {
                  CookieMonster.considerFullConsent();
                }}>
                <FormattedMessage id="ok-accept-everything" />
              </Button>
            </div>
          </div>
        )}
        <div>
          <Modal
            animation={false}
            show={showModal}
            onHide={() => {
              this.setState({ showModal: false });
            }}
            bsSize="large"
            id="cookies-modal"
            className="cookie-manager"
            aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton className="cookie-manager">
              <Modal.Title id="contained-modal-title-lg" className="cookie-manager">
                <FormattedMessage id="cookies-management" />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Cookie analyticsJs={analyticsJs} adJs={adJs} ref={this.cookie} />
            </Modal.Body>
            <Modal.Footer className="cookie-manager">
              <CloseButton
                buttonId="cookies-cancel"
                onClose={() => {
                  this.setState({ showModal: false });
                }}
              />
              <button className="ml-15 btn btn-primary" id="cookies-save" onClick={this.saveCookie}>
                <FormattedMessage id="global.save" />
              </button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
});

export default connect(mapStateToProps)(CookieModal);
