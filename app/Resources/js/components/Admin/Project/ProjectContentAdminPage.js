// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {|
|};

const ProjectContentAdminForm = (props: Props) => {
  return (
    <div className="col-md-12">
      <form>
        <div className="box box-primary container-fluid">
          <div className="box-header">
            <h4 className="box-title">
              <FormattedMessage id="admin.group.content" />
            </h4>
          </div>
          <div className="box-content">
            box
          </div>
        </div>
      </form> 
        </div>
  );
};

export default ProjectContentAdminForm;
