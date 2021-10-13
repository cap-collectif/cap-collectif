// @flow
type Options = {|
  +stripFirstRow?: (row: string) => boolean,
  +removeEmptyLines?: boolean,
|};

export const csvToArray = (content: string, options?: Options): Array<string> => {
  let rows = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map<string>(email =>
      email
        .replace(/['"]+/g, '')
        .replace(/\s/g, '')
        .toLowerCase(),
    );

  if (options?.removeEmptyLines) {
    rows = (rows.filter(row => row !== ''): string[]);
  }

  if (options?.stripFirstRow && rows.length > 0 && options.stripFirstRow(rows[0])) {
    rows.shift();
  }

  return rows;
};
