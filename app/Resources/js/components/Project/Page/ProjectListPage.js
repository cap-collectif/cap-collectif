// @flow
import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import Pagination from '../../Utils/Pagination';
import ProjectList from './../List/ProjectsList';
import ProjectListFilter from '../List/ProjectListFilter';
import Loader from '../../Utils/Loader';
import { changePage, fetchProjects } from '../../../redux/modules/project';
import type { State } from '../../../types';

export const ProjectListPage = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    project: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.dispatch(fetchProjects());
  },

  render() {
    const { project, features, dispatch } = this.props;
    const projects = project.visibleProjects.map(
      id => project.projectsById[id],
    );
    return (
      <div>
        <Row>
          <ProjectListFilter projectTypes={project.projectTypes || []} />
        </Row>
        <br /><br />
        <Loader show={project.isLoading}>
          <ProjectList projects={projects} />
          {features.projects_form &&
            project.count > 0 &&
            <Pagination
              nbPages={project.pages}
              current={project.page}
              onChange={wantedPage => {
                if (wantedPage !== project.page) {
                  dispatch(changePage(wantedPage));
                  dispatch(fetchProjects());
                }
              }}
            />}
        </Loader>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  themes: state.default.themes,
  project: state.project,
});

export default connect(mapStateToProps)(ProjectListPage);
