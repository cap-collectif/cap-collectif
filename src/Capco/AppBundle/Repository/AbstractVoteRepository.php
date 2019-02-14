<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;

class AbstractVoteRepository extends EntityRepository
{
    public function countPublished(): int
    {
        return $this->createQueryBuilder('v')
            ->select('COUNT(DISTINCT v.id)')
            ->andWhere('v.published = true')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countUnpublished(): int
    {
        return $this->createQueryBuilder('v')
            ->select('COUNT(DISTINCT v.id)')
            ->andWhere('v.published = false')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('v');
        $qb
            ->select('count(DISTINCT v)')
            ->andWhere('v.user = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Find all votes by author, only the public one.
     *
     * @see https://www.doctrine-project.org/projects/doctrine-orm/en/2.6/reference/native-sql.html
     */
    public function findAllByAuthor(User $user, int $limit = 100, int $offset = 0): array
    {
        $sqlRequest =
            'SELECT * FROM votes WHERE (private = 0 OR private IS NULL) AND voter_id = :user_id LIMIT :offset, :limit';

        $rsm = new ResultSetMapping();
        $rsm->addEntityResult(AbstractVote::class, 'v');
        $rsm->addFieldResult('v', 'id', 'id');
        $rsm->addFieldResult('v', 'created_at', 'createdAt');
        $rsm->addFieldResult('v', 'publishedAt', 'publishedAt');
        $rsm->addFieldResult('v', 'published', 'published');
        $rsm->addMetaResult('v', 'comment_id', 'comment_id');
        $rsm->addMetaResult('v', 'opinion_id', 'opinion_id');
        $rsm->addMetaResult('v', 'argument_id', 'argument_id');
        $rsm->addMetaResult('v', 'source_id', 'source_id');
        $rsm->addMetaResult('v', 'proposal_id', 'proposal_id');
        $rsm->addMetaResult('v', 'voter_id', 'voter_id');
        $rsm->addMetaResult('v', 'private', 'private');
        $rsm->addMetaResult('v', 'value', 'value');
        $rsm->addMetaResult('v', 'selection_step_id', 'selection_step_id');
        $rsm->addMetaResult('v', 'collect_step_id', 'collect_step_id');
        $rsm->addMetaResult('v', 'opinion_version_id', 'opinion_version_id');
        $rsm->addMetaResult('v', 'voteType', 'voteType');
        $rsm->setDiscriminatorColumn('v', 'voteType');

        $nativeQuery = $this->getEntityManager()
            ->createNativeQuery($sqlRequest, $rsm)
            ->setParameter('user_id', $user->getId())
            ->setParameter('offset', $offset)
            ->setParameter('limit', $limit);

        return $nativeQuery->execute();
    }

    /**
     * Gets the history of votes for a certain related item.
     *
     * @param mixed $objectType
     * @param mixed $object
     */
    public function getHistoryFor($objectType, $object)
    {
        $qb = $this->getEntityManager()
            ->createQueryBuilder()
            ->from(sprintf('Capco\\AppBundle\\Entity\\%sVote', ucfirst($objectType)), 'v')
            ->andWhere('v.published = true')
            ->addOrderBy('v.createdAt', 'ASC');
        if (\in_array($objectType, ['opinion', 'opinionVersion'], true)) {
            $qb
                ->addOrderBy('v.updatedAt', 'ASC')
                ->addSelect('v.updatedAt', 'v.value')
                ->andWhere(sprintf('v.%s = :object', $objectType))
                ->setParameter('object', $object);
        }

        $votes = $qb->getQuery()->getScalarResult();
        $result = [];
        $counts = ['date' => '', '-1' => 0, '0' => 0, '1' => 0];

        foreach ($votes as $i => $vote) {
            if (isset($counts[$vote['value']])) {
                ++$counts[$vote['value']];
                $counts['date'] = (new \DateTime(
                    $vote['updatedAt'] ?? $vote['createdAt']
                ))->getTimestamp();
                $result[] = array_values($counts);
            }
        }

        return $result;
    }

    /**
     * Get votes by user.
     *
     * @param user
     * @param mixed $user
     *
     * @return mixed
     */
    public function getPublicVotesByUser($user)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.media', 'm')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->orderBy('v.createdAt', 'ASC');

        $votes = $qb->getQuery()->execute();
        $publicVotes = [];
        /** @var AbstractVote $vote */
        foreach ($votes as $vote) {
            try {
                if (!method_exists($vote, 'getProposal') || !$vote->getProposal()->isDeleted()) {
                    if (!method_exists($vote, 'isPrivate') || !$vote->isPrivate()) {
                        $publicVotes[] = $vote;
                    }
                }
            } catch (EntityNotFoundException $e) {
            }
        }

        return $publicVotes;
    }

    public function getByObjectUser($objectType, $object, $user)
    {
        $qb = $this->getEntityManager()
            ->createQueryBuilder()
            ->from(sprintf('Capco\\AppBundle\\Entity\\%sVote', ucfirst($objectType)), 'v')
            ->andWhere('v.published = true');
        if (\in_array($objectType, ['opinion', 'opinionVersion'], true)) {
            $qb
                ->addSelect('v.value')
                ->andWhere(sprintf('v.%s = :object', $objectType))
                ->andWhere('v.user = :user')
                ->setParameter('user', $user)
                ->setParameter('object', $object);
        }

        $result = $qb->getQuery()->getOneOrNullResult();

        return $result ? $result['value'] : null;
    }

    public function getVotesFromCollectStep(AbstractStep $step): int
    {
        $count = 0;
        $id = $step->getId();

        $sql = "
            SELECT COUNT(v.id) as nb , 'opi' as entity
            FROM votes v
            LEFT JOIN opinion o ON v.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
            UNION
            SELECT COUNT(v.id) as nb, 'args' as entity
            FROM votes v
            LEFT JOIN argument a ON v.argument_id = a.id
            LEFT JOIN opinion o ON a.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
            UNION
            SELECT COUNT(v.id) as nb, 'src' as entity
            FROM votes v
            LEFT JOIN source s ON v.source_id = s.id
            LEFT JOIN opinion o ON s.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
            UNION
            SELECT COUNT(v.id) as nb, 'opv'as entity
            FROM votes v
            LEFT JOIN opinion_version ov ON v.opinion_version_id = ov.id
            LEFT JOIN opinion o ON ov.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
            UNION
            SELECT COUNT(v.id) as nb, 'aropv'as entity
            FROM votes v
            LEFT JOIN argument a ON v.argument_id = a.id
            LEFT JOIN opinion_version ov ON a.opinion_version_id = ov.id
            LEFT JOIN opinion o ON ov.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
            UNION
            SELECT COUNT(v.id) as nb, 'srcopv'as entity
            FROM votes v
            LEFT JOIN source s ON v.source_id = s.id
            LEFT JOIN opinion_version ov ON s.opinion_version_id = ov.id
            LEFT JOIN opinion o ON ov.opinion_id = o.id
            WHERE o.step_id =\"${id}\"
            AND v.published = true
        ";

        $stmt = $this->getEntityManager()
            ->getConnection()
            ->query($sql)
            ->fetchAll();

        foreach ($stmt as $result) {
            $count += $result['nb'];
        }

        return $count;
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')->andWhere('v.published = true');
    }
}
