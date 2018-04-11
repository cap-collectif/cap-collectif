// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer} from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Tab, Nav, NavItem, Panel, ListGroup } from 'react-bootstrap';
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
                id="left-tabs-example"
                defaultActiveKey={this.getDefaultKey()}
                >
                <Row className="clearfix">
                    <Col sm={4} md={3}>
                        <Nav bsStyle="pills" stacked>
                            <NavItem eventKey="account" >
                                <FormattedMessage id="user.profile.edit.profile" />
                            </NavItem>
                            <NavItem eventKey="personnal-data" >
                                <FormattedMessage id="personnal-data" />
                            </NavItem>
                            <NavItem eventKey="password" >
                                <FormattedMessage id="user.profile.edit.password" />
                            </NavItem>
                            <NavItem eventKey="notifications" className="tab">
                                <FormattedMessage id="user.profile.notifications.title" />
                            </NavItem>
                            <NavItem eventKey="followings" className="tab">
                                <FormattedMessage id="followings" />
                            </NavItem>
                        </Nav>
                    </Col>
                    <Col xs={12} sm={8} md={9}>
                        <Tab.Content animation>
                            <Tab.Pane eventKey="account">
                                <AccountBox />
                            </Tab.Pane>
                            <Tab.Pane eventKey="personnal-data">
                                Personnal data
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