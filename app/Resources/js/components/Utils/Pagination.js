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
    const offset = Math.floor(this.props.displayedPages / 2);
    let firstNumber = this.props.current - offset;
    const lastNumber = firstNumber + this.props.displayedPages - 1;
    firstNumber += this.props.nbPages - lastNumber < 0 ? this.props.nbPages - lastNumber : 0;
    firstNumber = firstNumber > 0 ? firstNumber : 1;
    const displayedPages = Array.apply(0, Array(this.props.displayedPages)).filter((x, y) => {
      return y + firstNumber <= this.props.nbPages;
    }).map((x, y) => {
      return y + firstNumber;
    });

    return (
      <div className="pagination--custom  text-center">
        <ul className="pagination">
          {
            this.props.showFirst
            ? <PaginationItem
                page={1}
                onSelect={this.onSelect.bind(null, 1)}
                label="&laquo;"
                ariaLabel="Page 1"
                disabled={this.props.current < 2}
                active={false}
              />
            : null
          }
          {
            this.props.showPrev
              ? <PaginationItem
                  page={this.props.current - 1}
                  onSelect={this.onSelect.bind(null, this.props.current - 1)}
                  label="&lsaquo;"
                  ariaLabel={'Page ' + this.props.current - 1}
                  disabled={this.props.current < 2}
                  active={false}
                />
              : null
          }
          {
            displayedPages.map((page) => {
              return (
                <PaginationItem
                  page={page}
                  onSelect={this.onSelect.bind(null, page)}
                  ariaLabel={'Page ' + page}
                  disabled={false}
                  active={this.props.current === page}
                />
              );
            })
          }
          {
            this.props.showNext
              ? <PaginationItem
                  page={this.props.current + 1}
                  onSelect={this.onSelect.bind(null, this.props.current + 1)}
                  label="&rsaquo;"
                  ariaLabel={'Page ' + this.props.current + 1}
                  disabled={this.props.current > (this.props.nbPages - 1)}
                  active={false}
                />
              : null
          }
          {
            this.props.showLast
              ? <PaginationItem
                  page={this.props.nbPages}
                  onSelect={this.onSelect.bind(null, this.props.nbPages)}
                  label="&raquo;"
                  ariaLabel={'Page ' + this.props.nbPages}
                  disabled={this.props.current > (this.props.nbPages - 1)}
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
