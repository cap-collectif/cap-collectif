// @flow
import type { UpdatePaperVoteInput } from '~relay/UpdatePaperVoteMutation.graphql';

const REFERENCE = 0;
const VOTES_TOTAL = 2;
const POINTS_TOTAL = 3;

export type ProposalType = {|
  +id: string,
  +fullReference: string,
  +title: string,
  +paperVotesTotalCount: number,
  +paperVotesTotalPointsCount: number,
  +canContactAuthor: boolean,
  +nbrOfMessagesSentToAuthor: number,
|};

const getCsvHeaders = (isVoteRanking: boolean): Array<string> => {
  return isVoteRanking
    ? ['reference', 'title', 'votes-total', 'points-total']
    : ['reference', 'title', 'votes-total'];
};

const getProposalIdFromFullReference = (
  fullReference: string,
  proposals: Array<ProposalType>,
): string => {
  return proposals.find(proposal => proposal.fullReference === fullReference)?.id ?? '';
};

const isValidHeader = (headerRow: string): boolean => {
  return (
    headerRow === getCsvHeaders(true).join(';') ||
    headerRow === getCsvHeaders(true).join(',') ||
    headerRow === getCsvHeaders(false).join(';') ||
    headerRow === getCsvHeaders(false).join(',')
  );
};

export const getCsvTitle = (projectTitle: string, selectedStepTitle: string): string => {
  return `${projectTitle}-${selectedStepTitle}-import-paper-votes.csv`;
};

export const generateCsvContent = (proposals: Array<ProposalType>, isVoteRanking: boolean) => {
  const universalBomForExcel = '\uFEFF';
  return encodeURI(
    `data:text/csv;charset=utf-8,${universalBomForExcel}${getCsvHeaders(isVoteRanking).join(
      ';',
    )}\r\n${proposals
      .map(proposal => {
        const count = proposal.paperVotesTotalCount > 0 ? proposal.paperVotesTotalCount : '';
        if (isVoteRanking) {
          const points =
            proposal.paperVotesTotalPointsCount > 0 ? proposal.paperVotesTotalPointsCount : '';
          return `="""${proposal.fullReference}""";"${proposal.title}";${count};${points}`;
        }
        return `="""${proposal.fullReference}""";"${proposal.title}";${count}`;
      })
      .join('\r\n')}`,
  );
};

export const isValidDatum = (
  splitRow: Array<string>,
  isVoteRanking: boolean,
  proposals: Array<ProposalType>,
): boolean => {
  return (
    splitRow.length >= getCsvHeaders(isVoteRanking).length &&
    proposals.some(proposal => proposal.fullReference === splitRow[REFERENCE].replace(/"/g, '')) &&
    /^[0-9]*$/.test(splitRow[VOTES_TOTAL])
  );
};

export const isEmptyDatum = (splitRow: Array<string>): boolean => {
  return /^\s*$/.test(splitRow[VOTES_TOTAL]);
};

export const isAlreadyThere = (
  data: Array<UpdatePaperVoteInput>,
  newSplitRow: Array<string>,
): boolean => {
  return data.some(datum => datum.proposal === newSplitRow[REFERENCE].replace(/"/g, ''));
};

export const splitResult = (result: string): ?Array<string> => {
  const rows = result.replace(/\r\n/g, '\n').split('\n');
  if (!isValidHeader(rows[0])) {
    return undefined;
  }
  rows.shift();

  if (rows[rows.length - 1] === '') {
    rows.pop();
  }

  return rows;
};

// the first capture group catches cells separated by " , ; \s
// the second is juste to handle cells using three quotes.
export const splitRow = (line: string): Array<string> => {
  return line.match(/(".*?"|[^",;\s]+)(?=\s*,|;|\s*$)/g) ?? [];
};

export const formatData = (
  split: Array<string>,
  stepId: string,
  isVoteRanking: boolean,
  proposals: Array<ProposalType>,
): UpdatePaperVoteInput => {
  const points = isVoteRanking ? Number(split[POINTS_TOTAL]) : 0;
  return {
    proposal: getProposalIdFromFullReference(split[REFERENCE].replace(/"/g, ''), proposals),
    step: stepId,
    count: Number(split[VOTES_TOTAL]),
    points,
  };
};
