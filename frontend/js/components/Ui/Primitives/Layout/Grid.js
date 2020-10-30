/* eslint-disable flowtype/require-valid-file-annotation,react/prop-types */
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';

// typings is handled by the .d.ts file
const Grid = React.forwardRef((props, ref) => {
  const {
    templateColumns,
    gap,
    rowGap,
    columnGap,
    autoFlow,
    autoRows,
    autoColumns,
    templateRows,
    templateAreas,
    area,
    column,
    row,
    autoFit,
    autoFill,
    ...rest
  } = props;
  const styles = {
    ...(autoFit &&
      typeof autoFit === 'boolean' &&
      autoFit === true && {
        gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`,
      }),
    ...(autoFit &&
      typeof autoFit === 'object' && {
        gridTemplateColumns: `repeat(auto-fit, minmax(${autoFit.min ?? '100px'}, ${autoFit.max ??
          '1fr'}))`,
      }),
    ...(autoFill &&
      typeof autoFill === 'boolean' &&
      autoFill === true && {
        gridTemplateColumns: `repeat(auto-fill, minmax(100px, 1fr))`,
      }),
    ...(autoFill &&
      typeof autoFill === 'object' && {
        gridTemplateColumns: `repeat(auto-fill, minmax(${autoFill.min ?? '100px'}, ${autoFill.max ??
          '1fr'}))`,
      }),
  };
  return (
    <AppBox
      display="grid"
      gridTemplateColumns={templateColumns}
      gridGap={gap}
      gridRowGap={rowGap}
      gridColumnGap={columnGap}
      gridAutoFlow={autoFlow}
      gridAutoRows={autoRows}
      gridAutoColumns={autoColumns}
      gridTemplateRows={templateRows}
      gridTemplateAreas={templateAreas}
      gridArea={area}
      gridColumn={column}
      gridRow={row}
      ref={ref}
      css={styles}
      {...rest}
    />
  );
});

export default Grid;
