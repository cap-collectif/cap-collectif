import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import IdeasList from '../List/IdeasList';
import Pagination from '../../Utils/Pagination';

const IdeasPaginatedList = React.createClass({
  propTypes: {
    ideas: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    nbPages: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { currentPage, nbPages, ideas, onChangePage } = this.props;
    const showPagination = nbPages > 1;
    return (
      <div>
        <IdeasList ideas={ideas} />
        {
          ideas.length === 0
            ? <p className="block text-center">
            {this.getIntlMessage('idea.no_result')}
          </p>
            : null
        }
        {
          showPagination
          ? <Pagination
              current={currentPage}
              nbPages={nbPages}
              onChange={onChangePage}
          />
          : null
        }
      </div>
    );
  },

});

export default IdeasPaginatedList;
