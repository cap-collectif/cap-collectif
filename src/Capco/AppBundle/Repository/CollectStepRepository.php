<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\Tools\Pagination\Paginator;

class CollectStepRepository extends AbstractStepRepository
{
    /**
     * Get last enabled collect steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return Paginator
     */
    public function getLastEnabled($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas', 'p')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return new Paginator($qb, ($fetchJoin = true));
    }

    public function getCollectStepsForProject(Project $project): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position', 'ASC')
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getBySlug(string $slug, string $projectSlug): ?CollectStep
    {
        $collectStep = parent::getBySlug($slug, $projectSlug);

        if (null === $collectStep) {
            return null;
        }

        \assert($collectStep instanceof CollectStep);

        return $collectStep;
    }

    public function findProposalArchivableSteps(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.proposalArchivedTime > 0')
            ->andWhere('s.voteThreshold > 0')
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<CollectStep>
     */
    public function findByParticipantWithVotes(Participant $participant): array
    {
        $qb = $this->createQueryBuilder('s')
            ->join('s.collectVotes', 'v')
            ->where('v.participant = :participant')
            ->setParameter('participant', $participant)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<CollectStep>
     */
    public function findByEnabledImapConfig(): array
    {
        return $this->createQueryBuilder('s')
            ->join('s.collectStepImapServerConfig', 'csi')
            ->andWhere('s.isCollectByEmailEnabled = true')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return array<CollectStep>
     */
    public function findWithVotes(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->join('s.collectVotes', 'v')
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }
}
