// @flow
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ButtonGroup, Button, Modal} from 'react-bootstrap';
import CloseButton from "../Form/CloseButton";
import Cookie, {saveCookiesConfiguration} from "./Cookie";

type Props = {
    analyticsJs: ?string,
    adJs: ?string,
    bannerTrad: string,
};
type State = {
    showModal: boolean,
};

export class CookieModal extends React.Component<Props, State> {
    state = {
        showModal: false,
    };

    render() {
        const {analyticsJs, adJs, bannerTrad} = this.props;
        const {showModal} = this.state;
        return (
            <div>
                <div id="cookie-banner" className="cookie-banner">
                    <div className="col-sm-9"><FormattedMessage id={bannerTrad}/></div>
                    <div className="col-sm-3 d-flex justify-content-end">
                        <Button id="cookie-more-button" className="mr-10 mt-10" bsStyle="default"
                                onClick={() => {
                                    this.setState({showModal: true});
                                }} name="cookie-more">
                            <FormattedMessage id="cookies-setting"/>
                        </Button>
                        <div id="cookie-button-container">
                            <Button id="cookie-consent" bsStyle="default"
                                    className="btn btn-default btn-sm mt-10" onClick={() => {
                                console.log('accept all');
                            }}>
                                <FormattedMessage id="ok-accept-everything"/>
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <Modal
                        animation={false}
                        show={showModal}
                        onHide={() => {
                            this.setState({showModal: false});
                        }}
                        bsSize="large"
                        aria-labelledby="contained-modal-title-lg">
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-lg">
                                <FormattedMessage id="cookies-management"/>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <Cookie analyticsJs={analyticsJs} adJs={adJs}/>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <ButtonGroup className="d-inline-block">
                                <CloseButton
                                    onClose={() => {
                                        this.setState({showModal: false});
                                    }}
                                />
                                <Button
                                    className="ml-15"
                                    bsStyle="primary"
                                    id="cookies-save"
                                    onClick={() => {
                                        saveCookiesConfiguration();
                                    }}>
                                    <FormattedMessage id="global.save"/>
                                </Button>
                            </ButtonGroup>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default CookieModal;
