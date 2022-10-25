<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\UserBundle\Entity\User;

trait CommentableRepositoryTrait
{
    public function countByCommentableIdsComments(
        string $type,
        array $commentableIds,
        ?User $viewer = null
    ): array {
        $qb = $this->getByCommentableIdsQueryBuilder($type, $commentableIds, true, $viewer)
            ->select('p.id as commentable_id, count(c.id) AS totalCount')
            ->groupBy('p.id');
        $qb->andWhere("c.moderationStatus = 'APPROVED'");

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getArrayResult();
    }

    public function countCommentsAndAnswersByCommentableIds(
        string $type,
        array $ids,
        ?User $viewer
    ): array {
        $qb = $this->getByCommentableIdsQueryBuilder($type, $ids, false, $viewer)
            ->select('p.id as commentable_id, count(c.id) AS totalCount')
            ->andWhere("c.moderationStatus = 'APPROVED'")
            ->groupBy('p.id');

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getArrayResult();
    }

    public function getByCommentableIds(
        string $type,
        array $commentableIds,
        ?int $offset,
        ?int $limit,
        string $field,
        string $direction,
        ?User $viewer
    ): array {
        $qb = $this->getByCommentableIdsQueryBuilder($type, $commentableIds, true, $viewer);
        // Pinned always come first
        $qb->addOrderBy('c.pinned', 'DESC');

        $qb->andWhere("c.moderationStatus = 'APPROVED'");

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('c.publishedAt', $direction);
            if ($type === ProposalComment::class || $type === Proposal::class) {
                $qb->addOrderBy('c.createdAt', $direction);
            }
        }

        if ('UPDATED_AT' === $field) {
            $qb->addOrderBy('c.updatedAt', $direction);
        }

        if ('POPULARITY' === $field) {
            $qb->addOrderBy('c.votesCount', $direction);
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        $qb = $qb->getQuery();
        return $qb->getResult();
    }
}
