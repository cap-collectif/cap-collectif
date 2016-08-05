import React from 'react';
import PaginationItem from './PaginationItem';

export default class Pagination extends React.Component {

  constructor() {
    super();
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(newPage) {
    this.props.onChange(newPage);
  }

  render() {
    const { current, displayedPages, nbPages } = this.props;
    const offset = Math.floor(displayedPages / 2);
    let firstNumber = current - offset;
    const lastNumber = firstNumber + displayedPages - 1;
    firstNumber += nbPages - lastNumber < 0 ? nbPages - lastNumber : 0;
    firstNumber = firstNumber > 0 ? firstNumber : 1;
    const pages = Array.apply(0, new Array(displayedPages)).filter((x, y) => {
      return y + firstNumber <= nbPages;
    }).map((x, y) => {
      return y + firstNumber;
    });
    const prev = current > 1 ? current - 1 : 1;
    const next = current < nbPages ? current + 1 : nbPages;

    return (
      <div className="pagination--custom  text-center">
        <ul className="pagination">
          {
            this.props.showFirst
            ? <PaginationItem
                id="first-page-item"
                page={1}
                onSelect={this.onSelect.bind(null, 1)}
                label="&laquo;"
                ariaLabel="Page 1"
                disabled={current < 2}
                active={false}
            />
            : null
          }
          {
            this.props.showPrev
              ? <PaginationItem
                  id="prev-page-item"
                  page={prev}
                  onSelect={this.onSelect.bind(null, prev)}
                  label="&lsaquo;"
                  ariaLabel={`Page ${prev}`}
                  disabled={current < 2}
                  active={false}
              />
              : null
          }
          {
            pages.map((page, index) => {
              return (
                <PaginationItem
                  id={`page-item-${page}`}
                  page={page}
                  key={index}
                  onSelect={this.onSelect.bind(null, page)}
                  ariaLabel={`Page ${page}`}
                  disabled={false}
                  active={current === page}
                />
              );
            })
          }
          {
            this.props.showNext
              ? <PaginationItem
                  id="next-page-item"
                  page={next}
                  onSelect={this.onSelect.bind(null, next)}
                  label="&rsaquo;"
                  ariaLabel={`Page ${next}`}
                  disabled={current > (nbPages - 1)}
                  active={false}
              />
              : null
          }
          {
            this.props.showLast
              ? <PaginationItem
                  id="last-page-item"
                  page={nbPages}
                  onSelect={this.onSelect.bind(null, nbPages)}
                  label="&raquo;"
                  ariaLabel={`Page ${nbPages}`}
                  disabled={current > (nbPages - 1)}
                  active={false}
              />
              : null
          }
        </ul>
      </div>
    );
  }

}

Pagination.propTypes = {
  current: React.PropTypes.number.isRequired,
  nbPages: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
  displayedPages: React.PropTypes.number,
  showFirst: React.PropTypes.bool,
  showLast: React.PropTypes.bool,
  showPrev: React.PropTypes.bool,
  showNext: React.PropTypes.bool,
};

Pagination.defaultProps = {
  displayedPages: 3,
  showFirst: true,
  showLast: true,
  showPrev: true,
  showNext: true,
};

Pagination.displayName = 'Pagination';
