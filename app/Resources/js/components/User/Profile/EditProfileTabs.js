// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer} from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import AccountBox from './AccountBox';
import type {FeatureToggles} from "../../../types";
import NotificationsForm from "./NotificationsForm";
import FollowingsProposals from "../Following/FollowingsProposals";
import type EditProfileTabs_viewer from './__generated__/EditProfileBoxQuery.graphql';

type Props = {
    features: FeatureToggles,
    viewer: EditProfileTabs_viewer
};

export class EditProfileTabs extends Component<Props> {
    getHashKey(hash: string) {
        if (hash.indexOf('account') !== -1) {
            return 'account';
        }
        if (hash.indexOf('personnal-data') !== -1) {
            return 'personnal-data';
        }
        if (hash.indexOf('password') !== -1) {
            return 'password';
        }
        if (hash.indexOf('notifications') !== -1) {
            return 'notifications';
        }
        if (hash.indexOf('followings') !== -1) {
            return 'followings';
        }
        return 'account';
    }

    getDefaultKey() {
        const hash = typeof window !== 'undefined' ? window.location.hash : null;
        if (hash) {
            return this.getHashKey(hash);
        }
        return 'account';
    }
    render(){
        const { viewer, features } = this.props;

        return (
            <Tab.Container
                id="account-tabs"
                defaultActiveKey={this.getDefaultKey()}
                >
                <Row className="clearfix">
                    <Col sm={4} md={3}>
                        <Panel id="panel-account" header={"Dupont"}>
                            <ListGroup>
                            <Nav bsStyle="pills" stacked>
                                <NavItem eventKey="account" >
                                    <ListGroupItem>
                                        <span className="icon cap-setting-gear-1"></span>
                                        <FormattedMessage id="user.profile.edit.profile" />
                                    </ListGroupItem>
                                </NavItem>
                                <NavItem eventKey="personal-data" >
                                    <ListGroupItem >
                                    <FormattedMessage id="personal-data" />
                                    </ListGroupItem>
                                </NavItem>
                                <NavItem eventKey="password" >
                                    <ListGroupItem>
                                    <FormattedMessage id="user.profile.edit.password" />
                                    </ListGroupItem>
                                </NavItem>
                                <NavItem eventKey="notifications" className="tab">
                                    <ListGroupItem>
                                    <FormattedMessage id="user.profile.notifications.title" />
                                    </ListGroupItem>
                                </NavItem>
                                <NavItem eventKey="followings" className="tab">
                                    <ListGroupItem>
                                    <FormattedMessage id="followings" />
                                    </ListGroupItem>
                                </NavItem>
                            </Nav>
                            </ListGroup>
                        </Panel>
                    </Col>
                    <Col xs={12} sm={8} md={9}>
                        <Tab.Content animation>
                            <Tab.Pane eventKey="account">
                                <AccountBox />
                            </Tab.Pane>
                            <Tab.Pane eventKey="personal-data">
                                Personal data
                            </Tab.Pane>
                            <Tab.Pane eventKey="password">
                                Password
                            </Tab.Pane>
                            <Tab.Pane eventKey="notifications">
                                <Panel header={<FormattedMessage id="profile.account.notifications.title" />}>
                                    <NotificationsForm viewer={viewer}/>
                                </Panel>
                            </Tab.Pane>
                            <Tab.Pane eventKey="followings">
                                <FollowingsProposals viewer={viewer}/>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        );
    }
}

export default createFragmentContainer(
    EditProfileTabs,
    graphql`
        fragment EditProfileTabs_viewer on User {
            ...FollowingsProposals_viewer
            ...NotificationsForm_viewer
        }
    `
);