import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  HandleProposalFormCategoryImageMutation,
  HandleProposalFormCategoryImageMutation$variables,
  HandleProposalFormCategoryImageMutation$data,
} from '@relay/HandleProposalFormCategoryImageMutation.graphql'

const mutation = graphql`
    mutation HandleProposalFormCategoryImageMutation($input: HandleProposalFormCategoryImageInput!) {
        handleProposalFormCategoryImage(input: $input) {
            categoryImage {
                id
                image {
                    url
                    id
                    name
                    type: contentType
                }
            }
            deletedCategoryImageId
        }
    }
` as GraphQLTaggedNode

const commit = (variables: HandleProposalFormCategoryImageMutation$variables): Promise<HandleProposalFormCategoryImageMutation$data> =>
  commitMutation<HandleProposalFormCategoryImageMutation>(environment, {
    mutation,
    variables,
    updater: store => {
      const root = store.getRoot();
      const payload = store.getRootField('handleProposalFormCategoryImage');

      if (!payload) return;

      const categoryImage = payload.getLinkedRecord('categoryImage');
      const deletedCategoryImageId = payload.getValue('deletedCategoryImageId');
      const categoryImages = root.getLinkedRecords('categoryImages', {isDefault: false});

      if (deletedCategoryImageId) {
        // delete from all categories images
        const updatedCategoryImages = categoryImages.filter(record => record.getDataID() !== deletedCategoryImageId);
        root.setLinkedRecords(updatedCategoryImages, 'categoryImages', { isDefault: false })
        return;
      }

      const updatedCategoryImages = [...categoryImages, categoryImage]
      root.setLinkedRecords(updatedCategoryImages, 'categoryImages', { isDefault: false })
    }
  })

export default {
  commit,
}
