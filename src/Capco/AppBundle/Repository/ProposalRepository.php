<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProposalRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('p');
        $qb->addSelect(
            'progressSteps',
            'status',
            'author',
            'theme',
            'district',
            'category',
            'likers',
            'proposalEvaluation',
            'proposalForm',
            'step'
        )
            ->leftJoin('p.proposalForm', 'proposalForm')
            ->leftJoin('proposalForm.step', 'step')
            ->leftJoin('p.author', 'author')
            ->leftJoin('p.status', 'status')
            ->leftJoin('p.theme', 'theme')
            ->leftJoin('p.district', 'district')
            ->leftJoin('p.category', 'category')
            ->leftJoin('p.likers', 'likers')
            ->leftJoin('p.progressSteps', 'progressSteps')
            ->leftJoin('p.proposalEvaluation', 'proposalEvaluation')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public static function getOneBySlugCacheKey(string $id)
    {
        return 'SiteImageRepository_getValuesIfEnabled_resultcache_' . $id;
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlug(string $slug): ?Proposal
    {
        // This subquery will use the "idx_slug" index to retrieve the proposal id
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');

        $query = $this->_em
            ->createNativeQuery('SELECT p.id as id FROM proposal p WHERE p.slug = :slug', $rsm)
            ->setParameter('slug', $slug)
        ;

        $id = $query->getSingleScalarResult();

        if (!$id) {
            return null;
        }

        // This query will hydrate the proposal
        $qb = $this->createQueryBuilder('p')
            ->andWhere('p.id = :proposalId')
            ->setParameter('proposalId', $id)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getOneBySlugCacheKey($slug))
            ->getOneOrNullResult()
        ;
    }

    public function getProposalsGroupedByCollectSteps(User $user, bool $onlyVisible = false): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('district', 'status', 'theme', 'form', 'step')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.proposalForm', 'form')
            ->leftJoin('form.step', 'step')
            ->andWhere('proposal.author = :author')
            ->setParameter('author', $user)
        ;

        $results = $qb->getQuery()->getResult();

        if ($onlyVisible) {
            $results = array_filter($results, function ($proposal) {
                return $proposal->isVisible();
            });
        }

        $proposalsWithStep = [];
        foreach ($results as $result) {
            $collectStep = $result->getProposalForm()->getStep();

            if (!$collectStep) {
                continue;
            }

            if (isset($proposalsWithStep[$collectStep->getId()])) {
                $proposalsWithStep[$collectStep->getId()]['proposals'][] = $result;
            } else {
                $proposalsWithStep[$collectStep->getId()] = [
                    'step' => $collectStep,
                    'proposals' => [$result],
                ];
            }
        }

        return $proposalsWithStep;
    }

    public function countProposalsByFormAndEvaluer(ProposalForm $form, User $user): int
    {
        return $this->qbProposalsByFormAndEvaluer($form, $user)
            ->select('COUNT(proposal.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function isViewerAnEvaluer(Proposal $proposal, User $user): bool
    {
        return $this->createQueryBuilder('proposal')
            ->select('COUNT(proposal.id)')
            ->leftJoin('proposal.evaluers', 'group')
            ->leftJoin('group.userGroups', 'userGroup')
            ->andWhere('proposal.id = :id')
            ->andWhere('userGroup.user = :user')
            ->setParameter('id', $proposal->getId())
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    public function isViewerAnEvaluerOfAProposalOnForm(ProposalForm $form, User $user): bool
    {
        return $this->createQueryBuilder('proposal')
            ->select('COUNT(proposal.id)')
            ->leftJoin('proposal.evaluers', 'group')
            ->leftJoin('group.userGroups', 'userGroup')
            ->andWhere('proposal.proposalForm = :form')
            ->andWhere('userGroup.user = :user')
            ->setParameter('form', $form)
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    public function getUnpublishedByFormAndAuthor(ProposalForm $form, User $author): array
    {
        return $this->createQueryBuilder('proposal')
            ->andWhere('proposal.proposalForm = :form')
            ->andWhere('proposal.author = :author')
            ->andWhere('proposal.published = false')
            ->andWhere('proposal.draft = false')
            ->setParameter('form', $form)
            ->setParameter('author', $author)
            ->getQuery()
            ->getResult()
        ;
    }

    public function getProposalsByFormAndEvaluer(
        ProposalForm $form,
        User $user,
        int $first,
        int $offset,
        string $field,
        string $direction = 'DESC'
    ): Paginator {
        $qb = $this->qbProposalsByFormAndEvaluer($form, $user)
            ->setFirstResult($first)
            ->setMaxResults($offset)
        ;

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('proposal.publishedAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countFusionsByProposalForm(ProposalForm $form): int
    {
        // TODO: Let's try count(*)
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(proposal)')
            ->andWhere('proposal.proposalForm = :form')
            ->andWhere('SIZE(proposal.childConnections) > 0')
            ->setParameter('form', $form)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countByUser(User $user): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(proposal.id)')
            ->andWhere('proposal.author = :author')
            ->setParameter('author', $user)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByUser(User $user, ?int $limit = null, ?int $offset = null): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->andWhere('proposal.author = :author')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->setParameter('author', $user)
        ;

        return $qb->getQuery()->execute();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('p');
        $qb->select('count(DISTINCT p)')
            ->andWhere('p.author = :author')
            ->setParameter('author', $user)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('p');
        $qb->andWhere('p.author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    public function getOne(string $slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district', 'responses', 'questions')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.responses', 'responses')
            ->leftJoin('responses.question', 'questions')
            ->andWhere('proposal.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getLast(?int $limit = 1, ?int $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
            ->andWhere('proposal.trashedStatus IS NULL')
            ->addOrderBy('proposal.createdAt', 'DESC')
            ->addGroupBy('proposal.id')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    /**
     * Get last proposals.
     */
    public function getLastByStep(mixed $limit, mixed $offset, AbstractStep $step)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.proposalForm', 'f')
            ->andWhere('f.step = :step')
            ->setParameter('step', $step)
            ->addOrderBy('proposal.createdAt', 'DESC')
            ->addGroupBy('proposal.id')
        ;

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return $qb->getQuery()->execute();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT proposal)')
            ->leftJoin('proposal.proposalForm', 'form')
            ->andWhere('form.step IN (:steps)')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), function ($step) {
                    return $step->isCollectStep() || $step->isSelectionStep();
                })
            )
            ->andWhere('proposal.author = :author')
            ->setParameter('author', $author)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult()
        ;
    }

    public function countByAuthorAndStep(User $author, CollectStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT proposal)')
            ->leftJoin('proposal.proposalForm', 'f')
            ->andWhere('proposal.author = :author')
            ->andWhere('f.step =:step')
            ->setParameter('step', $step)
            ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getProposalMarkersForCollectStep(CollectStep $step): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author')
            ->leftJoin('proposal.proposalForm', 'proposalForm')
            ->leftJoin('proposal.author', 'author')
            ->andWhere('proposalForm.step = :step')
            ->setParameter('step', $step)
        ;
        $qb = $this->getWithFilledAddressQueryBuilder($qb);

        return $qb->getQuery()->getArrayResult();
    }

    public function getProposalMarkersForSelectionStep(SelectionStep $step): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author')
            ->leftJoin('proposal.selections', 'selections')
            ->leftJoin('proposal.author', 'author')
            ->andWhere('selections.selectionStep = :step')
            ->setParameter('step', $step)
        ;
        $qb = $this->getWithFilledAddressQueryBuilder($qb);

        return $qb->getQuery()->getArrayResult();
    }

    public function getProposalsWithCostsForStep(CollectStep $step, ?int $limit = null): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal.title as name', 'proposal.estimation as value')
            ->leftJoin('proposal.proposalForm', 'proposalForm')
            ->andWhere('proposalForm.step = :step')
            ->setParameter('step', $step)
            ->orderBy('proposal.estimation', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function getProposalsWithVotesCountForSelectionStep(
        SelectionStep $step,
        $limit = null,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ): array {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal.title as name')
            ->addSelect(
                '(
                SELECT COUNT(pv.id) as pvCount
                FROM CapcoAppBundle:ProposalSelectionVote pv
                LEFT JOIN pv.proposal as pvp
                LEFT JOIN pv.selectionStep ss
                WHERE ss.id = :stepId
                AND pvp.id = proposal.id
            ) as value'
            )
            ->leftJoin('proposal.selections', 'selections')
            ->leftJoin('selections.selectionStep', 'selectionStep')
            ->andWhere('selectionStep.id = :stepId')
            ->setParameter('stepId', $step->getId())
        ;

        if ($themeId) {
            $qb->leftJoin('proposal.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb->leftJoin('proposal.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        if ($categoryId) {
            $qb->andWhere('proposal.category = :categoryId')->setParameter(
                'categoryId',
                $categoryId
            );
        }

        $qb->orderBy('value', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function getTotalCostForStep(CollectStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder('p')
            ->select('SUM(p.estimation)')
            ->leftJoin('p.proposalForm', 'pf')
            ->andWhere('pf.step = :step')
            ->setParameter('step', $step)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countForSelectionStep(
        SelectionStep $step,
        $themeId = null,
        $districtId = null,
        $categoryId = null
    ): int {
        $qb = $this->getIsEnabledQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->leftJoin('p.selections', 'selections')
            ->leftJoin('selections.selectionStep', 'ss')
            ->andWhere('ss.id = :stepId')
            ->setParameter('stepId', $step->getId())
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

    public function getWithFilledAddressQueryBuilder(
        QueryBuilder $queryBuilder,
        string $alias = 'proposal'
    ): QueryBuilder {
        return $queryBuilder->andWhere($alias . '.address IS NOT NULL');
    }

    public function findFollowingProposalByUser(
        User $user,
        int $first = 0,
        int $offset = 100
    ): Paginator {
        $query = $this->createQueryBuilder('p')
            ->leftJoin('p.followers', 'f')
            ->andWhere('f.user = :user')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('user', $user)
            ->setMaxResults($offset)
            ->setFirstResult($first)
        ;

        return new Paginator($query);
    }

    public function countFollowingProposalByUser(User $user): int
    {
        $query = $this->createQueryBuilder('p');
        $query
            ->select('COUNT(p.id)')
            ->leftJoin('p.followers', 'f')
            ->andWhere('f.user = :user')
            ->andWhere('p.deletedAt IS NULL')
            ->setParameter('user', $user)
        ;

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countProposalVotesCreatedBetween(
        \DateTime $from,
        \DateTime $to,
        string $proposalId
    ): array {
        $qb = $this->createQueryBuilder('proposal');
        $qb->select('proposal.id')
            ->addSelect('COUNT(selectionVotes.id) as sVotes,COUNT(collectVotes.id) as cVotes')
            ->leftJoin('proposal.collectVotes', 'collectVotes')
            ->leftJoin('proposal.selectionVotes', 'selectionVotes')
            ->andWhere($qb->expr()->between('selectionVotes.createdAt', ':from', ':to'))
            ->orWhere($qb->expr()->between('collectVotes.createdAt', ':from', ':to'))
            ->andWhere($qb->expr()->eq('proposal.id', ':id'))
            ->setParameters(['from' => $from, 'to' => $to, 'id' => $proposalId])
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function countProposalCommentsCreatedBetween(
        \DateTime $from,
        \DateTime $to,
        string $proposalId
    ): array {
        $qb = $this->createQueryBuilder('proposal');
        $qb->select('proposal.id');
        $qb->addSelect('COUNT(comments.id) as countComment')
            ->leftJoin('proposal.comments', 'comments')
            ->andWhere($qb->expr()->between('comments.createdAt', ':from', ':to'))
            ->andWhere($qb->expr()->eq('proposal.id', ':id'))
            ->setParameters(['from' => $from, 'to' => $to, 'id' => $proposalId])
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function proposalStepChangedBetween(
        \DateTime $from,
        \DateTime $to,
        string $proposalId
    ): array {
        $qb = $this->createQueryBuilder('proposal');
        $qb->select('proposal.id')
            ->addSelect('sStep.title as titleStep', 'selections.createdAt', 'status.name as sName')
            ->leftJoin('proposal.selections', 'selections')
            ->leftJoin('selections.selectionStep', 'sStep')
            ->leftJoin('selections.status', 'status')
            ->andWhere($qb->expr()->between('selections.createdAt', ':from', ':to'))
            ->andWhere($qb->expr()->eq('proposal.id', ':id'))
            ->orderBy('selections.createdAt', 'DESC')
            ->setParameters(['from' => $from, 'to' => $to, 'id' => $proposalId])
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function countPublishedProposalByStep(CollectStep $cs): int
    {
        $query = $this->getProposalQueryPublishedByStep($cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countPublishedProposalByStepGroupedByStep(CollectStep $collectStep): int
    {
        $query = $this->getProposalQueryPublishedByStep($collectStep);
        $query->groupBy('pf.step');

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function getProposalsByAuthorViewerCanSee(
        User $viewer,
        User $user,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $qb = $this->createProposalsByAuthorViewerCanSeeQuery($viewer, $user)
            ->setMaxResults($limit)
            ->setFirstResult($offset)
        ;

        return $qb->getQuery()->getResult();
    }

    public function countProposalsByAuthorViewerCanSee(User $viewer, User $user): int
    {
        $qb = $this->createProposalsByAuthorViewerCanSeeQuery($viewer, $user);
        $qb->select('COUNT(DISTINCT p.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getPublicProposalsByAuthor(
        User $author,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $qb = $this->createPublicProposalsByAuthorQuery($author);
        $qb->setMaxResults($limit)->setFirstResult($offset);

        return $qb->getQuery()->getResult();
    }

    public function countPublicProposalsByAuthor(User $author): int
    {
        $qb = $this->createPublicProposalsByAuthorQuery($author);
        $qb->select('COUNT(DISTINCT p.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findByProposalIds(array $proposalIds = []): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.id IN (:proposals)')
            ->setParameter('proposals', $proposalIds)
            ->getQuery()
            ->getResult()
        ;
    }

    public function getAssignedProposalsByProject(
        Project $project,
        User $viewer,
        int $first = 0,
        int $limit = 10
    ): Paginator {
        $qb = $this->getQueryProposalWithProject()
            ->distinct()
            ->leftJoin('p.proposalAnalysts', 'analysts')
            ->leftJoin('p.decisionMaker', 'decisionMaker')
            ->leftJoin('p.supervisor', 'supervisor')
            ->andWhere('pas.project = :project')
        ;
        $qb->andWhere(
            $qb
                ->expr()
                ->orX(
                    'analysts.analyst = :viewer',
                    'decisionMaker.decisionMaker = :viewer',
                    'supervisor.supervisor = :viewer'
                )
        )
            ->setParameter('project', $project)
            ->setParameter('viewer', $viewer)
            ->setFirstResult($first)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function countAssignedProposalsByProject(Project $project, User $viewer): int
    {
        /** @var QueryBuilder $qb */
        $qb = $this->getQueryProposalWithProject()
            ->select('COUNT(DISTINCT(p.id))')
            ->leftJoin('p.proposalAnalysts', 'analysts')
            ->leftJoin('p.decisionMaker', 'decisionMaker')
            ->leftJoin('p.supervisor', 'supervisor')
            ->andWhere('pas.project = :project')
        ;
        $qb->andWhere(
            $qb
                ->expr()
                ->orX(
                    'analysts.analyst = :viewer',
                    'decisionMaker.decisionMaker = :viewer',
                    'supervisor.supervisor = :viewer'
                )
        )
            ->setParameter('project', $project)
            ->setParameter('viewer', $viewer)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findByProposalForm(ProposalForm $form): array
    {
        return $this->createQueryBuilder('proposal')
            ->select('proposal.id')
            ->andWhere('proposal.proposalForm = :form')
            ->setParameter('form', $form)
            ->getQuery()
            ->getArrayResult()
        ;
    }

    public function getProposalByEmailAndTitleOnProposalForm(
        string $title,
        string $authorEmail,
        ProposalForm $proposalForm
    ): int {
        $query = $this->createQueryBuilder('proposal')
            ->select('COUNT(proposal.id)')
            ->leftJoin('proposal.author', 'author')
            ->andWhere('proposal.proposalForm = :form')
            ->andWhere('proposal.title = :title')
            ->andWhere('author.email = :user')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('proposal.trashedAt IS NULL')
            ->setParameter('form', $proposalForm)
            ->setParameter('title', $title)
            ->setParameter('user', $authorEmail)
        ;

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getProposalsByProject(string $projectId, ?int $limit = null, ?int $offset = null): array
    {
        $qb = $this->getQueryProposalWithProject();
        $qb->andWhere($qb->expr()->eq('pas.project', ':projectId'))->setParameter(
            ':projectId',
            $projectId
        );
        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return $qb->getQuery()->getResult();
    }

    public function findArchivableByStep(AbstractStep $step, int $voteThreshold): array
    {
        if (false === $step instanceof CollectStep && false === $step instanceof SelectionStep) {
            throw new \Exception('Given step should be either Collect or Selection Step');
        }

        $isCollectStep = $step instanceof CollectStep;
        $votesTable = $isCollectStep ? 'collectVotes' : 'selectionVotes';

        $qb = $this
            ->createQueryBuilder('p')
            ->addSelect('paperVotes')
        ;

        if ($isCollectStep) {
            $qb->join('p.proposalForm', 'pf')
                ->join('pf.step', 's')
            ;
        } else {
            $qb->join('p.selections', 'selections')
                ->join('selections.selectionStep', 's')
            ;
        }

        $qb->leftJoin("p.{$votesTable}", 'v', 'p.proposal = v.proposal')
            ->leftJoin('p.paperVotes', 'paperVotes', 'p.proposal = paperVotes.proposal')
            ->where('s.id = :step')
            ->andWhere('p.isArchived = false')
            ->groupBy('p.id')
            ->having('(COUNT(v.id) + paperVotes.totalCount) < :voteThreshold')
            ->setParameter('step', $step->getId())
            ->setParameter('voteThreshold', $voteThreshold)
        ;

        return $qb->getQuery()->getResult();
    }

    public function save(Proposal $proposal): bool
    {
        $this->_em->persist($proposal);
        $this->_em->flush();

        return true;
    }

    public function countPaperVotes(string $proposalId, string $stepId): int
    {
        $qb = $this->createQueryBuilder('p')
            ->select('pv.totalCount')
            ->join('p.paperVotes', 'pv')
            ->where('p.id = :proposalId')
            ->andWhere('pv.step = :stepId')
            ->setParameter('proposalId', $proposalId)
            ->setParameter('stepId', $stepId)
        ;

        try {
            return $qb->getQuery()->getSingleScalarResult();
        } catch (NoResultException) {
            return 0;
        }
    }

    public function countPaperVotesPoints(string $proposalId, string $stepId): int
    {
        $qb = $this->createQueryBuilder('p')
            ->select('pv.totalPointsCount')
            ->join('p.paperVotes', 'pv')
            ->where('p.id = :proposalId')
            ->andWhere('pv.step = :stepId')
            ->setParameter('proposalId', $proposalId)
            ->setParameter('stepId', $stepId)
        ;

        try {
            return $qb->getQuery()->getSingleScalarResult();
        } catch (NoResultException) {
            return 0;
        }
    }

    protected function getIsEnabledQueryBuilder(string $alias = 'proposal'): QueryBuilder
    {
        return $this->createQueryBuilder($alias)
            ->andWhere($alias . '.draft = false')
            ->andWhere($alias . '.trashedAt IS NULL')
            ->andWhere($alias . '.deletedAt IS NULL')
            ->andWhere($alias . '.published = true')
        ;
    }

    protected function getQueryProposalWithProject(): QueryBuilder
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pf.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
        ;
    }

    // This return the query used to retrieve all the proposals of an author the logged user can see.
    private function createProposalsByAuthorViewerCanSeeQuery(
        User $viewer,
        User $user
    ): QueryBuilder {
        $qb = $this->getIsEnabledQueryBuilder('p');
        $qb->andWhere('p.author = :user')
            ->leftJoin('p.selections', 'ps')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pf.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pabs')
            ->leftJoin('pabs.project', 'pro')
            ->leftJoin('pro.authors', 'pr_au')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->orderBy('p.createdAt', 'DESC')
        ;
        if ($viewer !== $user && !$viewer->isSuperAdmin()) {
            // The call of the function below filters the contributions according to the visibility
            // of the project containing it, as well as the privileges of the connected user.
            $this->getContributionsViewerCanSee($qb, $viewer);
            if (!$viewer->isAdmin()) {
                $qb->andWhere(
                    $qb
                        ->expr()
                        ->orX(
                            $qb
                                ->expr()
                                ->andX(
                                    $qb->expr()->isInstanceOf('s', ':collectStep'),
                                    $qb->expr()->eq('s.private', 'false')
                                ),
                            $qb
                                ->expr()
                                ->andX(
                                    $qb->expr()->isInstanceOf('s', ':collectStep'),
                                    $qb->expr()->eq('s.private', 'true'),
                                    $qb->expr()->isNotNull('ps.selectionStep')
                                ),
                            $qb->expr()->eq(':viewer', 'pr_au.user')
                        )
                );
                // All the proposals have a CollectStep.
                $qb->setParameter(':collectStep', $this->_em->getClassMetadata(CollectStep::class));
            }
            $qb->setParameter(':viewer', $viewer);
        }
        $qb->setParameter(':user', $user);

        return $qb;
    }

    private function createPublicProposalsByAuthorQuery(User $author): QueryBuilder
    {
        $qb = $this->getIsEnabledQueryBuilder('p');
        $qb->andWhere('p.author = :author')
            ->leftJoin('p.selections', 'ps')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pf.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pabs')
            ->leftJoin('pabs.project', 'pro')
            ->orderBy('p.createdAt', 'DESC')
            ->andWhere($qb->expr()->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC))
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb
                            ->expr()
                            ->andX(
                                $qb->expr()->isInstanceOf('s', ':collectStep'),
                                $qb->expr()->eq('s.private', 'false')
                            ),
                        $qb
                            ->expr()
                            ->andX(
                                $qb->expr()->isInstanceOf('s', ':collectStep'),
                                $qb->expr()->eq('s.private', 'true'),
                                $qb->expr()->isNotNull('ps.selectionStep')
                            )
                    )
            )
            ->setParameters([
                ':author' => $author,
                ':collectStep' => $this->_em->getClassMetadata(CollectStep::class),
            ])
        ;

        return $qb;
    }

    private function getProposalQueryPublishedByStep(CollectStep $cs): QueryBuilder
    {
        $query = $this->createQueryBuilder('p');

        return $query
            ->select('count(p.id)')
            ->leftJoin('p.proposalForm', 'pf')
            ->andWhere('pf.step = :cs')
            ->andWhere('p.draft = 0')
            ->andWhere('p.trashedAt IS NULL')
            ->andWhere('p.deletedAt IS NULL')
            ->andWhere('p.published = 1')
            ->setParameter('cs', $cs)
        ;
    }

    private function qbProposalsByFormAndEvaluer(ProposalForm $form, User $user): QueryBuilder
    {
        return $this->createQueryBuilder('proposal')
            ->leftJoin('proposal.evaluers', 'group')
            ->leftJoin('group.userGroups', 'userGroup')
            ->andWhere('proposal.proposalForm = :form')
            ->andWhere('userGroup.user = :user')
            ->setParameter('form', $form)
            ->setParameter('user', $user)
        ;
    }
}
