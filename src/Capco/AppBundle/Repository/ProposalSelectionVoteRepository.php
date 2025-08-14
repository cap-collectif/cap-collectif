<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Traits\AnonymousVoteRepositoryTrait;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\AppBundle\Traits\ProposalSelectionVoteRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalSelectionVoteRepository extends EntityRepository
{
    use AnonymousVoteRepositoryTrait;
    use ContributionRepositoryTrait;
    use ProposalSelectionVoteRepositoryTrait;

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv)')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.published = true')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.selectionStep IN (:steps)')
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

    public function getByProposalAndStepAndUser(
        Proposal $proposal,
        SelectionStep $step,
        User $author
    ): ?ProposalSelectionVote {
        return $this->createQueryBuilder('pv')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->setParameter('proposal', $proposal)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function countByAuthorAndStep(User $author, SelectionStep $step): int
    {
        return $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv)')
            ->andWhere('pv.selectionStep = :step')
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
        SelectionStep $step,
        int $limit = 0,
        int $offset = 0,
        ?string $field = null,
        ?string $direction = null
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.selectionStep = :step')
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
     * @return array<ProposalSelectionVote>
     */
    public function getVotesByStepAndContributor(SelectionStep $step, ContributorInterface $contributor, bool $published = true): array
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('pv', 'proposal')
            ->andWhere('pv.selectionStep = :step')
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

    public function getUserVotesGroupedByStepIds(
        array $selectionStepsIds,
        ?User $user = null
    ): array {
        $userVotes = [];
        if ($user) {
            foreach ($selectionStepsIds as $id) {
                $qb = $this->createQueryBuilder('pv')
                    ->select('proposal.id')
                    ->andWhere('pv.selectionStep = :id')
                    ->andWhere('pv.user = :user')
                    ->andWhere('pv.published = true')
                    ->leftJoin('pv.proposal', 'proposal')
                    ->andWhere('proposal.deletedAt IS NULL')
                    ->setParameter('user', $user)
                    ->setParameter('id', $id)
                ;
                $results = $qb->getQuery()->getScalarResult();
                $userVotes[$id] = array_map(fn ($id) => $id, array_column($results, 'id'));
            }
        }

        foreach ($selectionStepsIds as $id) {
            if (!isset($userVotes[$id])) {
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

    /**
     * @return array<AbstractVote>
     */
    public function getVotesForProposal(
        Proposal $proposal,
        ?int $limit = null,
        ?int $offset = null,
        ?string $field = null,
        string $direction = 'ASC'
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

    public function getByProposalAndStep(
        Proposal $proposal,
        SelectionStep $step,
        int $litmit,
        int $offset,
        string $field,
        string $direction,
        bool $includeUnpublished
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.selectionStep = :step')
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

        $qb->setMaxResults($litmit)->setFirstResult($offset);

        return new Paginator($qb);
    }

    public function countVotesByProposalIdsAndStep(
        array $ids,
        SelectionStep $step,
        bool $includeUnpublished
    ): array {
        $qb = $this->createQueryBuilder('pv')
            ->select('proposal.id, COUNT(pv.id) as total')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal IN (:ids)')
            ->leftJoin('pv.proposal', 'proposal')
            ->groupBy('pv.proposal')
            ->setParameter('ids', $ids)
            ->setParameter('step', $step)
        ;

        if (!$includeUnpublished) {
            $qb->andWhere('pv.published = true');
        }

        return $qb->getQuery()->getResult();
    }

    public function countVotesByProposalAndStep(
        Proposal $proposal,
        SelectionStep $step,
        bool $includeUnpublished
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setParameter('step', $step)
        ;

        if (!$includeUnpublished) {
            $qb->andWhere('pv.published = true');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getVotesForProposalByStepId(
        Proposal $proposal,
        string $stepId,
        $limit = null,
        $offset = 0
    ): array {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
            ->andWhere('pv.published = true')
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

    public function getVotesCountForSelectionStep(
        SelectionStep $step,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ) {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('pv.selectionStep = :step')
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

        if ($categoryId) {
            $qb->leftJoin('p.category', 'category')
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

    public function countPublishedSelectionVoteByStep(
        SelectionStep $step,
        bool $onlyAccounted = true
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.selectionStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1')
        ;
        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        return $qb
            ->andWhere('pv.isAccounted = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function countPointsOnPublishedSelectionVoteByStep(
        SelectionStep $step,
        bool $onlyAccounted = true
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('pv.position as position', 'cs.votesLimit as max', 'cs.votesMin as min')
            ->andWhere('pv.selectionStep = :step')
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
        foreach ($results as $result) {
            $pointsAvailable = [];
            for ($i = $result['max']; $i > 0; --$i) {
                $pointsAvailable[] = $i;
            }

            $pointsOnStep += $pointsAvailable[$result['position']];
        }

        return $pointsOnStep;
    }

    public function getByProposalIdsAndStepAndUser(
        array $ids,
        SelectionStep $step,
        User $author
    ): array {
        return $this->createQueryBuilder('pv')
            ->andWhere('pv.user = :author')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('pv.proposal IN (:ids)')
            ->setParameter('author', $author)
            ->setParameter('step', $step)
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findPaginatedByParticipant(
        Participant $participant,
        ?Mediator $mediator = null,
        ?Project $project = null,
        ?AbstractStep $step = null,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $qb = $this->findByParticipantQueryBuilder($participant, $mediator, $project, $step)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('participant', $participant)
        ;

        return $qb
            ->getQuery()
            ->getResult()
            ;
    }

    public function countByParticipant(
        Participant $participant,
        ?Mediator $mediator = null,
        ?Project $project = null,
        ?AbstractStep $step = null
    ): int {
        $qb = $this->findByParticipantQueryBuilder($participant, $mediator, $project, $step);

        return $qb
            ->select('COUNT(v.id)')
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }

    /** @return array<int, string> */
    public function findPublishedSelectionVoteIdsByStep(
        SelectionStep $step,
        bool $onlyAccounted = true
    ): array {
        $qb = $this->createQueryBuilder('pv')
            ->select('pv.id')
            ->andWhere('pv.selectionStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1')
        ;
        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        return $qb
            ->andWhere('pv.isAccounted = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->andWhere("pv.completionStatus = 'COMPLETED'")
            ->setParameter('step', $step)
            ->getQuery()
            ->getResult()
        ;
    }

    public function getCountsByProposalGroupedBySteps(Proposal $proposal, $asTitle = false): array
    {
        $items = array_map(fn ($value) => $asTitle ? $value->getTitle() : $value->getId(), $proposal->getSelectionSteps());

        $qb = $this->createQueryBuilder('pv');

        if ($asTitle) {
            $qb->select(
                'pv.position as position',
                'ss.votesLimit as max',
                'ss.title as stepId',
                'ss.votesRanking as votesRanking'
            );
        } else {
            $qb->select(
                'pv.position as position',
                'ss.votesLimit as max',
                'ss.id as stepId',
                'ss.votesRanking as votesRanking'
            );
        }

        $qb->leftJoin('pv.selectionStep', 'ss')
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
        /** @var ProposalSelectionVote $result */
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

        foreach ($items as $item) {
            if (!isset($data['votesBySteps'][$item])) {
                $data['votesBySteps'][$item] = 0;
            }
            if (!isset($data['pointsBySteps'][$item])) {
                $data['pointsBySteps'][$item] = 0;
            }
        }

        return $data;
    }

    /**
     * @return Paginator<QueryBuilder>
     */
    public function getByTokenAndStep(
        SelectionStep $step,
        string $token,
        int $limit = 0,
        int $offset = 0,
        ?string $field = null,
        ?string $direction = null
    ): Paginator {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.selectionStep = :step')
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

    public function findOneByProposalTokenAndStep(Proposal $proposal, string $token, SelectionStep $step): ?ProposalSelectionVote
    {
        $qb = $this->createQueryBuilder('pv')
            ->join('pv.participant', 'participant')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.selectionStep = :step')
            ->andWhere('participant.token = :token')
            ->setParameter('proposal', $proposal)
            ->setParameter('step', $step)
            ->setParameter('token', $token)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function countByTokenAndStep(SelectionStep $step, string $token): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv)')
            ->andWhere('pv.selectionStep = :step')
            ->join('pv.participant', 'participant', Join::WITH, 'participant.token = :token')
            ->leftJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->setParameter('token', $token)
            ->setParameter('step', $step)
        ;

        return (int) $qb
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    public function countDistinctPhonePublishedSelectionVoteByStep(SelectionStep $step): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.phone)')
            ->andWhere('pv.selectionStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1')
        ;

        return (int) $qb
            ->andWhere('pv.isAccounted = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
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
     * @return array<ProposalSelectionVote>
     */
    public function findByParticipantAndStep(Participant $participant, SelectionStep $step, bool $published = true): array
    {
        $qb = $this->createQueryBuilder('v')
            ->where('v.participant = :participant')
            ->andwhere('v.selectionStep = :step')
            ->setParameter('participant', $participant)
            ->setParameter('step', $step)
        ;

        if ($published) {
            $qb->andWhere('v.published = 1');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<ProposalSelectionVote>
     */
    public function findMissingRequirementsByParticipantTokenAndStep(string $participantToken, SelectionStep $step): array
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.participant', 'participant')
            ->where('pv.selectionStep = :step')
            ->andWhere('pv.completionStatus = :completionStatus')
            ->andWhere('participant.token = :participantToken')
            ->setParameter('participantToken', $participantToken)
            ->setParameter('step', $step)
            ->setParameter('completionStatus', ContributionCompletionStatus::MISSING_REQUIREMENTS)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @throws NoResultException
     * @throws NonUniqueResultException
     */
    public function countByConfirmedParticipantEmail(string $email, SelectionStep $step): int
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->join('pv.participant', 'p')
            ->where('p.email = :email')
            ->andWhere('p.confirmationToken IS NULL')
            ->andWhere('pv.selectionStep = :step')
            ->setParameter('email', $email)
            ->setParameter('step', $step)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countDistinctParticipantPublishedCollectVoteByStep(
        SelectionStep $step,
        bool $onlyAccounted
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.participant)')
            ->andWhere('pv.selectionStep = :step')
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
     * @return array<ProposalSelectionVote>
     */
    public function findExistingContributorByStepAndPhoneNumber(SelectionStep $step, string $phone, ContributorInterface $contributor): array
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
            ->andWhere('v.selectionStep = :step')
            ->setParameter('step', $step)
            ->setParameter('phone', $phone)
            ->setParameter('contributor', $contributor)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<ProposalSelectionVote>
     */
    public function findByParticipantEmail(string $participantEmail, SelectionStep $step): array
    {
        return $this->createQueryBuilder('v')
            ->join('v.participant', 'participant')
            ->where('participant.email = :participantEmail')
            ->andWhere('participant.confirmationToken IS NULL')
            ->andWhere('v.selectionStep = :step')
            ->setParameters([
                'participantEmail' => $participantEmail,
                'step' => $step,
            ])
            ->getQuery()
            ->getResult()
            ;
    }

    private function findByParticipantQueryBuilder(
        Participant $participant,
        ?Mediator $mediator = null,
        ?Project $project = null,
        ?AbstractStep $step = null
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('v')
            ->where('v.participant = :participant')
            ->setParameter('participant', $participant)
        ;

        if ($mediator) {
            $qb->andWhere('v.mediator = :mediator')
                ->setParameter('mediator', $mediator)
            ;
        }

        if ($project) {
            $qb->join('v.selectionStep', 's')
                ->join('s.projectAbstractStep', 'pas')
                ->join('pas.project', 'p')
                ->andWhere('p = :project')
                ->setParameter('project', $project)
            ;
        }

        if ($step) {
            $qb->join('v.selectionStep', 's')
                ->andWhere('s = :step')
                ->setParameter('step', $step)
            ;
        }

        return $qb;
    }
}
