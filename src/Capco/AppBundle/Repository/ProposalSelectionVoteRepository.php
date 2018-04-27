<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Traits\AnonymousVoteRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalSelectionVoteRepository extends EntityRepository
{
    use AnonymousVoteRepositoryTrait;

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv)')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.expired = false')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.selectionStep IN (:steps)')
            ->setParameter('steps', array_map(function ($step) {
                return $step;
            }, $project->getRealSteps()))
            ->setParameter('author', $author)
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    public function countByAuthorAndStep(User $author, SelectionStep $step): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv)')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.expired = false')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    public function getVotesByStepAndUser(SelectionStep $step, User $user): array
    {
        return $this->createQueryBuilder('pv')
          ->select('pv', 'proposal')
          ->andWhere('pv.selectionStep = :step')
          ->andWhere('pv.user = :user')
          ->andWhere('pv.expired = 0')
          ->leftJoin('pv.proposal', 'proposal')
          ->andWhere('proposal.id IS NOT NULL')
          ->andWhere('proposal.deletedAt IS NULL')
          ->setParameter('user', $user)
          ->setParameter('step', $step)
          ->getQuery()
          ->getResult()
        ;
    }

    public function getUserVotesGroupedByStepIds(array $selectionStepsIds, User $user = null): array
    {
        $userVotes = [];
        if ($user) {
            foreach ($selectionStepsIds as $id) {
                $qb = $this->createQueryBuilder('pv')
              ->select('proposal.id')
              ->andWhere('pv.selectionStep = :id')
              ->andWhere('pv.user = :user')
              ->andWhere('pv.expired = 0')
              ->leftJoin('pv.proposal', 'proposal')
              ->andWhere('proposal.deletedAt IS NULL')
              ->setParameter('user', $user)
              ->setParameter('id', $id)
              ;
                $results = $qb->getQuery()->getScalarResult();
                $userVotes[$id] = array_map(function ($id) {
                    return $id;
                }, array_column($results, 'id'));
            }
        }

        foreach ($selectionStepsIds as $id) {
            if (!array_key_exists($id, $userVotes)) {
                $userVotes[$id] = [];
            }
        }

        return $userVotes;
    }

    public function countVotesByStepAndUser(SelectionStep $step, User $user): int
    {
        return $this->createQueryBuilder('pv')
          ->select('COUNT(pv.id)')
          ->andWhere('pv.selectionStep = :selectionStep')
          ->andWhere('pv.user = :user')
          ->andWhere('pv.expired = 0')
          ->setParameter('selectionStep', $step)
          ->setParameter('user', $user)
          ->getQuery()
          ->getSingleScalarResult()
      ;
    }

    public function getCountsByProposalGroupedByStepsId(Proposal $proposal): array
    {
        return $this->getCountsByProposalGroupedBySteps($proposal);
    }

    public function getCountsByProposalGroupedByStepsTitle(Proposal $proposal): array
    {
        return $this->getCountsByProposalGroupedBySteps($proposal, true);
    }

    public function getVotesForProposal(Proposal $proposal, ?int $limit = null, string $field, int $offset = 0, string $direction = 'ASC'): Paginator
    {
        $query = $this->createQueryBuilder('pv')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
        ;

        if ('CREATED_AT' === $field) {
            $query->addOrderBy('pv.createdAt', $direction);
        }

        if ($limit) {
            $query->setMaxResults($limit);
            $query->setFirstResult($offset);
        }

        return new Paginator($query);
    }

    public function countVotesForProposal(Proposal $proposal): int
    {
        return (int) $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->getQuery()->getSingleScalarResult()
        ;
    }

    public function getByProposalAndStep(Proposal $proposal, SelectionStep $step, int $litmit, int $offset, string $field, string $direction): Paginator
    {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('step', $step)
            ->setParameter('proposal', $proposal);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('pv.createdAt', $direction);
        }

        $qb->setMaxResults($litmit)
            ->setFirstResult($offset);

        return new Paginator($qb);
    }

    public function countVotesByProposalAndStep(Proposal $proposal, SelectionStep $step): int
    {
        return (int) $this->createQueryBuilder('pv')
            ->select('COUNT(pv)')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getVotesForProposalByStepId(Proposal $proposal, string $stepId, $limit = null, $offset = 0): array
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
            ->setParameter('proposal', $proposal)
            ->andWhere('ss.id = :stepId')
            ->setParameter('stepId', $stepId)
            ->addOrderBy('pv.createdAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    public function getVotesCountForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null, $categoryId = null)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('pv.selectionStep = :step')
            ->setParameter('step', $step)
        ;

        if ($themeId) {
            $qb
                ->leftJoin('p.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb
                ->leftJoin('p.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        if ($categoryId) {
            $qb
                ->leftJoin('p.category', 'category')
                ->andWhere('category.id = :categoryId')
                ->setParameter('categoryId', $categoryId)
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getAnonymousVotesCountByStep(SelectionStep $selectionStep): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.private = true')
            ->andWhere('pv.selectionStep = :selectionStep')
            ->setParameter('selectionStep', $selectionStep)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getCountsByProposalGroupedBySteps(Proposal $proposal, $asTitle = false): array
    {
        $items = array_map(function ($value) use ($asTitle) {
            return $asTitle ? $value->getTitle() : $value->getId();
        }, $proposal->getSelectionSteps());

        $qb = $this->createQueryBuilder('pv');

        if ($asTitle) {
            $qb->select('COUNT(pv.id) as votesCount', 'ss.title as selectionStep');
        } else {
            $qb->select('COUNT(pv.id) as votesCount', 'ss.id as selectionStep');
        }

        $qb
            ->leftJoin('pv.selectionStep', 'ss')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.selectionStep');

        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];
        foreach ($results as $result) {
            $votesBySteps[$result['selectionStep']] = (int) $result['votesCount'];
        }
        foreach ($items as $item) {
            if (!array_key_exists($item, $votesBySteps)) {
                $votesBySteps[$item] = 0;
            }
        }

        return $votesBySteps;
    }
}
