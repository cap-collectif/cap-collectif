/**
 * @flow
 */
import React, {Component} from 'react';
import { FormattedMessage} from 'react-intl';
import { Button, Collapse } from 'react-bootstrap';
import UnfollowProposalMutation from '../../../mutations/UnfollowProposalMutation';
import type {FollowingsProposals_viewer} from "./__generated__/FollowingsProposals_viewer.graphql";
import ProposalRow from "./ProposalRow";

type Props = {
    project: Object,
    viewer: FollowingsProposals_viewer
};

export class ProjectRow extends Component<Props> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: true
        };
    }

    onUnfollowCurrentProject(){
        const {project, viewer} = this.props;
        const ids = viewer.followingProposals.filter(proposal => proposal.project.id === project.id).map((proposal) => {
            return proposal.id;
        });

        this.setState({open: !this.state.open}, () => {
                UnfollowProposalMutation.commit({input: {ids}}).then(() => {
                        return true;
                    }
                )
            }
        );
    }

    render() {
        const {project, viewer} = this.props;
        return (
            <Collapse in={this.state.open}>
                <div>
                    <h2><a href={project.show_url}>{project.title}</a></h2>
                    <Button onClick={this.onUnfollowCurrentProject.bind(this)} >
                        <FormattedMessage id="unfollow-this-project"/>
                    </Button>
                    {viewer.followingProposals.filter(proposal => proposal.project.id === project.id).map((proposal, key) => {
                        return (
                            <div key={`proposal_${key}`}>
                                <ProposalRow proposal={proposal}/>
                            </div>
                        );
                    })}
                </div>
            </Collapse>
        );
    }
}
export default ProjectRow;
