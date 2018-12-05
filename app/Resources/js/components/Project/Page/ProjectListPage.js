// @flow
import React from 'react';
import { Row } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import Pagination from '../../Utils/Pagination';
import ProjectList from '../List/ProjectsList';
import ProjectListFilter from '../List/ProjectListFilter';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import { changePage, fetchProjects } from '../../../redux/modules/project';
import type { State, Dispatch } from '../../../types';

type Props = {
  features: Object,
  project: Object,
  dispatch: Dispatch,
};

export class ProjectListPage extends React.Component<Props, State> {
  componentDidMount() {
    this.props.dispatch(fetchProjects());
  }

  render() {
    const { project, features, dispatch } = this.props;
    const projects = project.visibleProjects.map(id => project.projectsById[id]);
    return (
      <div>
        <ProjectListFilter projectTypes={project.projectTypes || []} />
        <Row>
          <Loader show={project.isLoading}>
            <ProjectList projects={projects} hasSecondTitle />
            {features.projects_form && project.count > 0 && (
              <Pagination
                nbPages={project.pages}
                current={project.page}
                onChange={wantedPage => {
                  if (wantedPage !== project.page) {
                    dispatch(changePage(wantedPage));
                    dispatch(fetchProjects());
                  }
                }}
              />
            )}
          </Loader>
        </Row>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  features: state.default.features,
  project: state.project,
});

export default connect(mapStateToProps)(ProjectListPage);
