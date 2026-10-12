<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class MediaResponseRepository extends EntityRepository
{
    /** @return list<MediaResponse> */
    public function findByMedia(Media $media): array
    {
        $filters = $this->getEntityManager()->getFilters();
        $wasEnabled = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);
        if ($wasEnabled) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        try {
            // Load incomplete replies before restoring the filter so attachment ownership can be checked.
            return $this->createQueryBuilder('r')
                ->addSelect('reply')->leftJoin('r.reply', 'reply')
                ->innerJoin('r.medias', 'm')
                ->where('m = :media')->setParameter('media', $media)
                ->getQuery()->getResult();
        } finally {
            if ($wasEnabled) {
                $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
        }
    }

    public function countParticipantsByQuestion(
        MediaQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(DISTINCT reply.author)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question')
        ;
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countByQuestion(
        MediaQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->select('COUNT(r.id)')
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question')
        ;
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getAllByQuestion(
        AbstractQuestion $question,
        $limit = 32,
        $offset = 0,
        bool $withNotConfirmedUser = false
    ): Paginator {
        /** @var QueryBuilder $qb */
        $qb = $this->getNoEmptyResultQueryBuilder()
            ->leftJoin('r.question', 'question')
            ->leftJoin('reply.author', 'author')
            ->andWhere('question.id = :question')
        ;
        if (!$withNotConfirmedUser) {
            $qb->andWhere(
                'author.newEmailConfirmationToken IS NULL AND author.confirmationToken IS NULL'
            );
        }
        $qb->setParameter('question', $question);

        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->useQueryCache(true)
        ;

        return new Paginator($query);
    }

    private function getNoEmptyResultQueryBuilder(): QueryBuilder
    {
        return // Some fixes until we use a proper JSON query
            // TODO: This only works for question on a reply
            // We must support responses on a proposal/other object
            $this->createQueryBuilder('r')
                ->leftJoin('r.reply', 'reply')
                ->andWhere('(reply.draft = false')
                ->leftJoin('r.medias', 'media')
                ->andWhere('media.id IS NOT NULL)')
            ;
    }
}
