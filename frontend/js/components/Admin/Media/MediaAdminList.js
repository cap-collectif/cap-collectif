// @flow
import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { SubmissionError } from 'redux-form';
import { createPaginationContainer, graphql, type RelayPaginationProp } from 'react-relay';
import * as S from './MediaAdminPage.style';
import type { MediaAdminList_query } from '~relay/MediaAdminList_query.graphql';
import { convertFileSize } from '~ui/File/File';
import PickableList from '~ui/List/PickableList';
import { usePickableList } from '~ui/List/PickableList/usePickableList';
import DeleteMediaAdminMutation from '~/mutations/DeleteMediaAdminMutation';
import { Link as Url } from '~ui/Link/Link';
import MediaAdminFileView from './MediaAdminFileView';
import MediaViewModal from './MediaViewModal';
import DeleteModal from '~/components/Modal/DeleteModal';

export const MEDIA_PAGINATION = 50;

type Props = {|
  query: MediaAdminList_query,
  +relay: RelayPaginationProp,
|};

const getFileExtension = (filename: string): string => filename.split('.').pop();

const isImage = (filename: string): boolean =>
  ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'svg', 'gif'].includes(getFileExtension(filename));

export const MediaAdminList = ({ query, relay }: Props) => {
  const { medias } = query;
  const intl = useIntl();
  const [showMediaViewModal, setShowMediaViewModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [viewedMedia, setViewedMedia] = useState<?string>(null);
  const [deletedMedia, setDeletedMedia] = useState<?string>(null);
  const { selectedRows } = usePickableList();

  const onDeleteMedias = (rows: string[]) => {
    return DeleteMediaAdminMutation.commit({
      input: {
        ids: rows,
      },
    })
      .then(response => {
        if (!response.deleteMediaAdmin) {
          throw new Error('Mutation "DeleteMediaAdminMutation" failed.');
        } else window.location.reload();
      })
      .catch(() => {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      });
  };

  return (
    <div style={{ display: 'flex', overflow: 'scroll' }}>
      <MediaViewModal
        show={showMediaViewModal}
        closeModal={() => setShowMediaViewModal(false)}
        url={viewedMedia}
      />
      <DeleteModal
        closeDeleteModal={() => {
          setShowDeleteModal(false);
          setDeletedMedia(null);
        }}
        showDeleteModal={showDeleteModal}
        deleteElement={() => {
          onDeleteMedias(deletedMedia ? [deletedMedia] : selectedRows);
        }}
        deleteModalTitle="media-delete-title"
        deleteModalContent="modia-delete-confirmation"
      />
      <S.ListContainer>
        <PickableList
          useInfiniteScroll
          hasMore={medias.pageInfo.hasNextPage}
          onScrollToBottom={() => {
            relay.loadMore(MEDIA_PAGINATION);
          }}>
          <S.MediaHeaderList>
            <S.MediaColumn size={400}>
              <FormattedMessage
                id={selectedRows.length ? 'selected-media-count' : 'media-count'}
                values={{ num: selectedRows.length || medias.totalCount }}
              />
              {selectedRows.length > 0 && (
                <button
                  type="button"
                  className="delete ml-5"
                  onClick={() => setShowDeleteModal(true)}>
                  <FormattedMessage id="global.delete" children={(msg: string) => <>{msg}</>} />
                </button>
              )}
            </S.MediaColumn>
            <S.MediaColumn size={100}>
              <FormattedMessage id="global.format" />
            </S.MediaColumn>
            <S.MediaColumn size={100}>
              <FormattedMessage id="editor.media.size" />
            </S.MediaColumn>
            <S.MediaColumn size={100}>
              <FormattedMessage id="table-head-label" />
            </S.MediaColumn>
            <S.MediaColumn size={300}>
              <FormattedMessage id="global.link" />
            </S.MediaColumn>
          </S.MediaHeaderList>

          <PickableList.Body>
            {medias.edges
              ?.filter(Boolean)
              .map(edge => edge.node)
              .filter(Boolean)
              .map(media => (
                <S.MediaRow rowId={media.id} key={media.id}>
                  <S.MediaColumnImage size={400}>
                    <div>
                      {isImage(media.providerReference) ? (
                        <img src={media.url} alt={media.name} />
                      ) : (
                        <MediaAdminFileView extension={getFileExtension(media.providerReference)} />
                      )}
                      <span>{media.name}</span>
                    </div>
                    <div>
                      {isImage(media.providerReference) && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setViewedMedia(media.url);
                              setShowMediaViewModal(true);
                            }}>
                            <FormattedMessage
                              id="action_show"
                              children={(msg: string) => <>{msg}</>}
                            />
                          </button>
                          <span>|</span>
                        </>
                      )}
                      <button
                        className="delete"
                        type="button"
                        onClick={() => {
                          setDeletedMedia(media.id);
                          setShowDeleteModal(true);
                        }}>
                        <FormattedMessage
                          id="global.delete"
                          children={(msg: string) => <>{msg}</>}
                        />
                      </button>
                    </div>
                  </S.MediaColumnImage>
                  <S.MediaColumn size={100}>
                    {getFileExtension(media.providerReference)}
                  </S.MediaColumn>
                  <S.MediaColumn size={100}>
                    {media.width && media.height ? `${media.width} x ${media.height}px` : null}
                  </S.MediaColumn>
                  <S.MediaColumn size={100}>{convertFileSize(Number(media.size))}</S.MediaColumn>
                  <S.MediaColumn size={300}>
                    <Url url={media.url} />
                  </S.MediaColumn>
                </S.MediaRow>
              ))}
          </PickableList.Body>
        </PickableList>
      </S.ListContainer>
    </div>
  );
};

export default createPaginationContainer(
  MediaAdminList,
  {
    query: graphql`
      fragment MediaAdminList_query on Query
        @argumentDefinitions(
          count: { type: "Int" }
          cursor: { type: "String" }
          term: { type: "String", defaultValue: null }
        ) {
        medias(first: $count, after: $cursor, term: $term)
          @connection(key: "MediaAdminList_medias", filters: ["term"]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              name
              url
              size
              width
              height
              providerReference
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    /*
     * Based on node_modules/react-relay/ReactRelayPaginationContainer.js.flow, when I ask something
     * in the pageInfo node, it forces me to include everything (e.g hasPrevPage, startCursor and
     * endCursor) but I only need `hasNextPage`
     * $FlowFixMe
     * */
    getConnectionFromProps(props: Props) {
      return props?.query?.medias;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      };
    },
    query: graphql`
      query MediaAdminListPaginatedQuery($count: Int, $cursor: String, $term: String) {
        ...MediaAdminList_query @arguments(count: $count, cursor: $cursor, term: $term)
      }
    `,
  },
);
