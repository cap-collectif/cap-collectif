<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|DebateAnonymousVote find($id, $lockMode = null, $lockVersion = null)
 * @method null|DebateAnonymousVote findOneBy(array $criteria, array $orderBy = null)
 * @method DebateAnonymousVote[]    findAll()
 * @method DebateAnonymousVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateAnonymousVoteRepository extends EntityRepository
{
    /**
     * @param string[] $ids
     *
     * @return DebateAnonymousVote[]
     */
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('dav');
        $qb->where('dav.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    /**
     * Count anonymous debate contributors (votes) for a project.
     *
     * IMPORTANT: We only count votes, not arguments, because users MUST vote before they can post an argument.
     */
    public function countAnonymousContributorsByProject(Project $project): int
    {
        return (int) $this->createQueryBuilder('dav')
            ->select('COUNT(dav.id)')
            ->innerJoin('dav.debate', 'd')
            ->innerJoin('d.step', 's')
            ->innerJoin('s.projectAbstractStep', 'pas')
            ->where('pas.project = :project')
            ->setParameter('project', $project)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
