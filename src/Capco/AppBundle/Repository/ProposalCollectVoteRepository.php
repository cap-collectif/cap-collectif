<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\AppBundle\Traits\ProposalCollectVoteRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalCollectVoteRepository extends EntityRepository
{
    use ContributionRepositoryTrait;
    use ProposalCollectVoteRepositoryTrait;

    public function getAnonymousVotesCountByStep(CollectStep $step): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.private = true')
            ->andWhere('pv.collectStep = :step')
            ->setParameter('step', $step)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByProposalIdsAndStepAndUser(
        array $ids,
        CollectStep $step,
        User $author
    ): array {
        return $this->createQueryBuilder('pv')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.proposal IN (:ids)')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @throws NoResultException
     * @throws NonUniqueResultException
     */
    public function countByConfirmedParticipantEmail(string $email, CollectStep $step): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->join('pv.participant', 'p')
            ->where('p.email = :email')
            ->andWhere('p.confirmationToken IS NULL')
            ->andWhere('pv.collectStep = :step')
            ->setParameter('email', $email)
            ->setParameter('step', $step)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return array<ProposalCollectVote>
     */
    public function findExistingContributorByStepAndPhoneNumber(CollectStep $step, string $phone, ContributorInterface $contributor): array
    {
        $participantFilter = '';
        $userFilter = '';

        if ($contributor instanceof Participant) {
            $participantFilter = ' AND participant <> :contributor';
        }

        if ($contributor instanceof User) {
            $userFilter = ' AND author <> :contributor';
        }

        $qb = $this->createQueryBuilder('v')
            ->leftJoin('v.participant', 'participant')
            ->leftJoin('v.user', 'author')
            ->where('participant.phone = :phone AND participant.phoneConfirmed = 1' . $participantFilter)
            ->orWhere('author.phone = :phone AND author.phoneConfirmed = 1' . $userFilter)
            ->andWhere('v.collectStep = :step')
            ->setParameter('step', $step)
            ->setParameter('phone', $phone)
            ->setParameter('contributor', $contributor)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getByProposalAndStepAndUser(
        Proposal $proposal,
        CollectStep $step,
        User $author
    ): ?ProposalCollectVote {
        return $this->createQueryBuilder('pv')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->setParameter('proposal', $proposal)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function getByProposalAndStep(
        Proposal $proposal,
        CollectStep $step,
        int $limit,
        int $offset,
        string $field,
        string $direction,
        bool $includeUnpublished
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('step', $step)
            ->setParameter('proposal', $proposal)
        ;

        if (!$includeUnpublished) {
            $qb->andWhere('pv.published = true');
        }

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('pv.publishedAt', $direction);
        }

        if ($limit > 0) {
            $qb->setMaxResults($limit);
        }
        $qb->setFirstResult($offset);

        return new Paginator($qb);
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.published = true')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.collectStep IN (:steps)')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), fn ($step) => $step->isCollectStep() || $step->isSelectionStep())
            )
            ->setParameter('author', $author)
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult()
        ;
    }

    public function countByAuthorAndStep(User $author, CollectStep $step): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.user = :author')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getByAuthorAndStep(
        User $author,
        CollectStep $step,
        int $limit = 0,
        int $offset = 0,
        ?string $field = null,
        ?string $direction = null
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.user = :author')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.id IS NOT NULL')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('step', $step)
            ->setParameter('author', $author)
        ;

        if ($field && $direction) {
            if ('PUBLISHED_AT' === $field) {
                $qb->addOrderBy('pv.publishedAt', $direction);
            }
            if ('POSITION' === $field) {
                $qb->addOrderBy('pv.position', $direction);
            }
        }

        if ($limit > 0) {
            $qb->setMaxResults($limit);
        }
        $qb->setFirstResult($offset);

        return new Paginator($qb);
    }

    // TODO remove this duplicate

    /**
     * @return array<ProposalCollectVote>
     */
    public function getVotesByStepAndContributor(CollectStep $step, ContributorInterface $contributor, bool $published = true): array
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('pv', 'proposal')
            ->andWhere('pv.collectStep = :step')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.id IS NOT NULL')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('step', $step)
        ;

        if ($contributor instanceof User) {
            $qb->andWhere('pv.user = :user');
            $qb->setParameter('user', $contributor);
        } elseif ($contributor instanceof Participant) {
            $qb->andWhere('pv.participant = :participant');
            $qb->setParameter('participant', $contributor);
        }

        if ($published) {
            $qb->andWhere('pv.published = true');
        }

        return $qb
            ->getQuery()
            ->getResult()
            ;
    }

    public function getUserVotesGroupedByStepIds(array $collectStepsIds, ?User $user = null): array
    {
        $userVotes = [];
        if ($user) {
            foreach ($collectStepsIds as $id) {
                $qb = $this->createQueryBuilder('pv')
                    ->select('proposal.id')
                    ->andWhere('pv.collectStep = :id')
                    ->andWhere('pv.user = :user')
                    ->leftJoin('pv.proposal', 'proposal')
                    ->andWhere('proposal.deletedAt IS NULL')
                    ->setParameter('user', $user)
                    ->setParameter('id', $id)
                ;
                $results = $qb->getQuery()->getScalarResult();
                $userVotes[$id] = array_map(fn ($id) => $id, array_column($results, 'id'));
            }
        }

        foreach ($collectStepsIds as $id) {
            if (!isset($userVotes[$id])) {
                $userVotes[$id] = [];
            }
        }

        return $userVotes;
    }

    public function countVotesByStepAndUser(CollectStep $step, User $user): int
    {
        return (int) $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.collectStep = :collectStep')
            ->andWhere('pv.user = :user')
            ->setParameter('collectStep', $step)
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function countVotesByProposalIdsAndStep(
        array $ids,
        CollectStep $step,
        bool $includeUnpublished
    ): array {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');
        $rsm->addScalarResult('total', 'total');
        // TODO includeUnpublished
        $query = $this->_em
            ->createNativeQuery(
                "SELECT v.proposal_id as id, COUNT(v.id) as total
              FROM votes v
              WHERE v.collect_step_id = :collect_step_id
                AND v.proposal_id IN (:ids)
                AND v.published = 1
                AND v.voteType IN ('proposalCollect')
              GROUP BY v.proposal_id
          ",
                $rsm
            )
            ->setParameter('collect_step_id', $step->getId())
            ->setParameter('ids', $ids)
        ;

        return $query->getResult();
    }

    public function countVotesByProposalAndStep(
        Proposal $proposal,
        CollectStep $step,
        bool $includeUnpublished
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setParameter('step', $step)
        ;

        if (!$includeUnpublished) {
            $qb->andWhere('pv.published = true');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countVotesByProposal($proposalId, bool $includeUnpublished): int
    {
        if (!\is_string($proposalId) && $proposalId instanceof Proposal) {
            $proposalId = $proposalId->getId();
        }

        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('p.id = :proposal')
            ->setParameter('proposal', $proposalId)
        ;

        if (!$includeUnpublished) {
            $qb->andWhere('pv.published = true');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getCountsByProposalGroupedByStepsId(Proposal $proposal): array
    {
        return $this->getCountsByProposalGroupedBySteps($proposal);
    }

    public function getCountsByProposalGroupedByStepsTitle(Proposal $proposal): array
    {
        return $this->getCountsByProposalGroupedBySteps($proposal, true);
    }

    public function getVotesForProposalByStepId(
        Proposal $proposal,
        string $stepId,
        $limit = null,
        $offset = 0
    ): array {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.collectStep', 'cs')
            ->where('pv.proposal = :proposal')
            ->andWhere('pv.published = true')
            ->setParameter('proposal', $proposal)
            ->andWhere('cs.id = :stepId')
            ->setParameter('stepId', $stepId)
            ->addOrderBy('pv.createdAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    public function getVotesCountForCollectStep(
        CollectStep $step,
        $themeId = null,
        $districtId = null
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('pv.collectStep = :step')
            ->setParameter('step', $step)
        ;

        if ($themeId) {
            $qb->leftJoin('p.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb->leftJoin('p.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return array<AbstractVote>
     */
    public function getVotesForProposal(
        Proposal $proposal,
        ?int $limit = null,
        ?int $offset = null,
        ?string $field = null,
        ?string $direction = 'ASC'
    ): array {
        $query = $this->createQueryBuilder('pv')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
        ;

        if ('PUBLISHED_AT' === $field) {
            $query->addOrderBy('pv.publishedAt', $direction);
        }

        if ($limit) {
            $query->setMaxResults($limit);
            $query->setFirstResult($offset);
        }

        return $query->getQuery()->getResult();
    }

    public function countPointsOnPublishedCollectVoteByStep(
        CollectStep $step,
        bool $onlyAccounted = true
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('pv.position as position', 'cs.votesLimit as max', 'cs.votesMin as min')
            ->andWhere('pv.collectStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.position IS NOT NULL')
            ->andWhere('pv.published = 1')
        ;
        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        $results = $qb
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->setParameter('step', $step)
            ->getQuery()
            ->getResult()
        ;

        $pointsOnStep = 0;
        /** @var ProposalCollectVote $result */
        foreach ($results as $result) {
            $pointsAvailable = [];
            for ($i = $result['max']; $i > 0; --$i) {
                $pointsAvailable[] = $i;
            }

            $pointsOnStep += $pointsAvailable[$result['position']];
        }

        return $pointsOnStep;
    }

    /**
     * @return Paginator<QueryBuilder>
     */
    public function getByTokenAndStep(
        CollectStep $step,
        string $token,
        int $limit = 0,
        int $offset = 0,
        ?string $field = null,
        ?string $direction = null
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->join('pv.participant', 'participant', Join::WITH, 'participant.token = :token')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.id IS NOT NULL')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('step', $step)
            ->setParameter('token', $token)
        ;

        if ($field && $direction) {
            if ('PUBLISHED_AT' === $field) {
                $qb->addOrderBy('pv.publishedAt', $direction);
            }
            if ('POSITION' === $field) {
                $qb->addOrderBy('pv.position', $direction);
            }
        }

        if ($limit > 0) {
            $qb->setMaxResults($limit);
        }
        $qb->setFirstResult($offset);

        return new Paginator($qb);
    }

    public function countByTokenAndStep(CollectStep $step, string $token): ?int
    {
        return (int) $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.collectStep = :step')
            ->join('pv.participant', 'participant', Join::WITH, 'participant.token = :token')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('token', $token)
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return array<ProposalCollectVote>
     */
    public function findByParticipantAndStep(Participant $participant, CollectStep $step, bool $published = true): array
    {
        $qb = $this->createQueryBuilder('v')
            ->where('v.participant = :participant')
            ->andwhere('v.collectStep = :step')
            ->setParameter('participant', $participant)
            ->setParameter('step', $step)
        ;

        if ($published) {
            $qb->andWhere('v.published = 1');
        }

        return $qb->getQuery()->getResult();
    }

    public function findOneByProposalTokenAndStep(Proposal $proposal, string $token, CollectStep $step): ?ProposalCollectVote
    {
        $qb = $this->createQueryBuilder('pv')
            ->join('pv.participant', 'participant')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.collectStep = :step')
            ->andWhere('participant.token = :token')
            ->setParameter('proposal', $proposal)
            ->setParameter('step', $step)
            ->setParameter('token', $token)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function countDistinctParticipantPublishedCollectVoteByStep(
        CollectStep $step,
        bool $onlyAccounted
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.participant)')
            ->andWhere('pv.collectStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->setParameter('step', $step)
        ;

        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        return (int) $qb
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return array<ProposalCollectVote>
     */
    public function findByParticipantEmail(string $participantEmail, CollectStep $step): array
    {
        return $this->createQueryBuilder('v')
            ->join('v.participant', 'participant')
            ->where('participant.email = :participantEmail')
            ->andWhere('participant.confirmationToken IS NULL')
            ->andWhere('v.collectStep = :step')
            ->setParameters([
                'participantEmail' => $participantEmail,
                'step' => $step,
            ])
            ->getQuery()
            ->getResult()
            ;
    }

    private function getCountsByProposalGroupedBySteps(
        Proposal $proposal,
        bool $asTitle = false
    ): array {
        if (!$proposal->getProposalForm()->getStep()) {
            return [];
        }

        $qb = $this->createQueryBuilder('pv');

        if ($asTitle) {
            $qb->select(
                'cs.title as stepId',
                'pv.position as position',
                'cs.votesLimit as max',
                'cs.votesRanking as votesRanking'
            );
            $index = $proposal
                ->getProposalForm()
                ->getStep()
                ->getTitle()
            ;
        } else {
            $qb->select(
                'cs.id as stepId',
                'pv.position as position',
                'cs.votesLimit as max',
                'cs.votesRanking as votesRanking'
            );
            $index = $proposal
                ->getProposalForm()
                ->getStep()
                ->getId()
            ;
        }

        $qb->leftJoin('pv.collectStep', 'cs')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.published = true')
            ->andWhere('pv.isAccounted = 1')
            ->setParameter('proposal', $proposal)
        ;

        $results = $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getResult()
        ;
        $data = [];
        $data['votesBySteps'] = [];
        $data['pointsBySteps'] = [];

        foreach ($results as $result) {
            $pointsAvailable = [];
            for ($i = $result['max']; $i > 0; --$i) {
                $pointsAvailable[] = $i;
            }
            $data['votesBySteps'][$result['stepId']] = \count($results);

            if (true === $result['votesRanking'] && null !== $result['position']) {
                if (
                    isset(
                        $data['pointsBySteps'][$result['stepId']],
                        $pointsAvailable[$result['position']]
                    )
                ) {
                    $data['pointsBySteps'][$result['stepId']] +=
                        $pointsAvailable[$result['position']];
                } elseif (isset($pointsAvailable[$result['position']])) {
                    $data['pointsBySteps'][$result['stepId']] =
                        $pointsAvailable[$result['position']];
                }
            }
        }

        if (!isset($data['votesBySteps'][$index])) {
            $data['votesBySteps'][$index] = 0;
        }
        if (!isset($data['pointsBySteps'][$index])) {
            $data['pointsBySteps'][$index] = 0;
        }

        return $data;
    }
}
