<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\QueryBuilder;

/**
 * @method null|Reply find($id, $lockMode = null, $lockVersion = null)
 * @method null|Reply findOneBy(array $criteria, array $orderBy = null)
 * @method Reply[]    findAll()
 * @method Reply[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class ReplyRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function countPublishedForQuestionnaire(Questionnaire $questionnaire): int
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('sclr', 'sclr');
        $query = $this->_em
            ->createNativeQuery(
                'SELECT COUNT(r.id) as sclr FROM reply r USE INDEX (idx_questionnaire_published) WHERE r.published = 1 AND r.is_draft = 0 AND r.questionnaire_id = :questionnaireId',
                $rsm
            )
            ->setParameter('questionnaireId', $questionnaire->getId())
        ;

        return (int) $query->getSingleScalarResult();
    }

    public function findPaginatedByParticipant(
        Participant $participant,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        return $this->createQueryBuilder('r')
            ->where('r.participant = :participant')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('participant', $participant)
            ->getQuery()
            ->getResult()
            ;
    }

    public function countByParticipant(Participant $participant): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.participant = :participant')
            ->setParameter('participant', $participant)
            ->getQuery()
            ->getSingleScalarResult() ?? 0;
    }

    public function countForQuestionnaire(
        Questionnaire $questionnaire,
        bool $includeUnpublished,
        bool $includeDraft
    ): int {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('sclr', 'sclr');

        $where = '';
        $where .= $includeUnpublished ? '' : ' r.published = 1 AND';
        $where .= $includeDraft ? '' : ' is_draft = 0 AND';

        $query = $this->_em
            ->createNativeQuery(
                'SELECT COUNT(r.id) as sclr FROM reply r USE INDEX (idx_questionnaire_published) WHERE' .
                    $where .
                    ' r.questionnaire_id = :questionnaireId',
                $rsm
            )
            ->setParameter('questionnaireId', $questionnaire->getId())
        ;

        return (int) $query->getSingleScalarResult();
    }

    public function getOneForUserAndQuestionnaire(Questionnaire $questionnaire, User $user): ?Reply
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('reply.questionnaire = :questionnaire')
            ->andWhere('reply.author = :user')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('user', $user)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByUser(User $user): array
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('reply.author = :author')
            ->setParameter('author', $user)
        ;

        return $qb->getQuery()->execute();
    }

    public function getByAuthorViewerCanSee(
        ?User $viewer,
        User $user,
        int $limit,
        int $offset
    ): array {
        $qb = $this->getPublishedNonDraftByAuthorQueryBuilder($user);
        $qb = $this->setPublicityConstraints($viewer, $qb);

        if (
            null === $viewer
            || (null !== $viewer && ($viewer->getId() !== $user->getId() && !$viewer->isAdmin()))
        ) {
            $qb = $qb->andWhere('reply.private = false');
        }

        $qb = $qb->setMaxResults($limit)->setFirstResult($offset);

        return $qb->getQuery()->getResult();
    }

    public function countRepliesByAuthorViewerCanSee(?User $viewer, User $user): int
    {
        $qb = $this->getPublishedNonDraftByAuthorQueryBuilder($user);
        $qb = $qb->select('COUNT(reply)');

        $qb = $this->setPublicityConstraints($viewer, $qb);

        if (
            null === $viewer
            || (null !== $viewer && ($viewer->getId() !== $user->getId() && !$viewer->isAdmin()))
        ) {
            $qb = $qb->andWhere('reply.private = false');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllByAuthor(User $author): int
    {
        $qb = $this->getPublicPublishedNonDraftByAuthorQueryBuilder($author);
        $qb->select('count(reply)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByAuthor(User $author): iterable
    {
        $qb = $this->getPublicPublishedNonDraftByAuthorQueryBuilder($author);

        return $qb->getQuery()->getResult();
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->where('r.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function hydrateFromIdsByTerm(array $ids, string $term): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->where('r.id IN (:ids)')
            ->join('r.author', 'a')
            ->andWhere('a.username LIKE :term')
            ->setParameters(['ids' => $ids, 'term' => "%{$term}%"])
        ;

        return $qb->getQuery()->getResult();
    }

    public function findByQuestionnaire(
        Questionnaire $questionnaire,
        int $offset,
        int $limit,
        bool $includeUnpublished,
        bool $includeDraft
    ): array {
        $where = '';
        $where .= $includeUnpublished ? '' : ' r.published = 1 AND';
        $where .= $includeDraft ? '' : ' is_draft = 0 AND';

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');

        // Using an ORDER BY "date" will trigger a filesort
        // This make the query too slow for such a huge table
        $nativeQuery = $this->getEntityManager()
            ->createNativeQuery(
                'SELECT r.id FROM reply r USE INDEX (idx_questionnaire_published) WHERE' .
                    $where .
                    ' r.questionnaire_id = :questionnaire LIMIT :offset, :limit',
                $rsm
            )
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('offset', $offset)
            ->setParameter('limit', $limit)
        ;

        $result = $nativeQuery->execute();
        $ids = array_map(fn ($data) => $data['id'], $result);

        return $this->hydrateFromIds($result);
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->andWhere('r.author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    public function getForUserAndQuestionnaire(
        Questionnaire $questionnaire,
        User $user,
        bool $excludePrivate = false,
        ?int $limit = null,
        ?int $offset = null
    ): Collection {
        $qb = $this->createQueryBuilder('reply')
            ->andWhere('reply.questionnaire = :questionnaire')
            ->andWhere('reply.author = :user')
            ->addOrderBy('reply.publishedAt', 'DESC')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('user', $user)
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }
        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($excludePrivate) {
            $qb->andWhere('reply.private = :private')->setParameter('private', false);
        }

        return new ArrayCollection($qb->getQuery()->getResult());
    }

    public function getEnabledByQuestionnaireAsArray(Questionnaire $questionnaire): array
    {
        $qb = $this->createQueryBuilder('reply')
            ->addSelect('author')
            ->leftJoin('reply.author', 'author')
            ->andWhere('reply.questionnaire = :questionnaire')
            ->setParameter('questionnaire', $questionnaire)
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(reply)')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->andWhere('questionnaire.step IN (:steps)')
            ->andWhere('reply.author = :author')
            ->andWhere('reply.draft = false')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), fn ($step) => $step instanceof QuestionnaireStep)
            )
            ->setParameter('author', $author)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult()
        ;
    }

    public function countByAuthorAndStep(User $author, QuestionnaireStep $step): int
    {
        // TODO: avoid leftJoin here would be better for perf
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(reply)')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->andWhere('reply.draft = false')
            ->andWhere('questionnaire.step = :step')
            ->andWhere('reply.author = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countRepliesByStep(QuestionnaireStep $step): int
    {
        // TODO: avoid leftJoin here would be better for perf
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(reply)')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->andWhere('questionnaire.step = :step')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return AbstractReply[]
     */
    public function getBatchOfPublishedReplies(string $questionnaireId, int $offset, int $limit): array
    {
        $qb = $this->createQueryBuilder('reply')
            ->select('reply')
            ->where('reply.questionnaire = :questionnaireId')
            ->andWhere('reply.published = true')
            ->setParameter('questionnaireId', $questionnaireId)
            ->setMaxResults($limit)
            ->setFirstResult($offset)
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getPublishedQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('reply')->andWhere('reply.published = true');
    }

    private function getPublishedNonDraftByAuthorQueryBuilder(User $author): QueryBuilder
    {
        return $this->createQueryBuilder('reply')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->leftJoin('questionnaire.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'abstractstep')
            ->leftJoin('abstractstep.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')

            ->andWhere('reply.published = true')
            ->andWhere('reply.author = :author')
            ->andWhere('reply.draft = false')
            ->setParameter('author', $author)
        ;
    }

    private function setPublicityConstraints(?User $viewer, QueryBuilder $qb): QueryBuilder
    {
        if (null !== $viewer) {
            $qb = $this->getContributionsViewerCanSee($qb, $viewer);
            $qb->setParameter(':viewer', $viewer);
        } else {
            $qb->andWhere(
                $qb->expr()->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            );
        }

        return $qb;
    }

    private function getPublicPublishedNonDraftByAuthorQueryBuilder(User $author): QueryBuilder
    {
        return $this->createQueryBuilder('reply')
            ->andWhere('reply.published = true')
            ->andWhere('reply.author = :author')
            ->andWhere('reply.draft = false')
            ->setParameter('author', $author)
        ;
    }
}
