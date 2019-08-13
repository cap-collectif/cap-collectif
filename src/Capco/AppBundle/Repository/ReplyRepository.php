<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\Query\ResultSetMapping;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;

/**
 * @method Reply|null find($id, $lockMode = null, $lockVersion = null)
 * @method Reply|null findOneBy(array $criteria, array $orderBy = null)
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
            ->setParameter('questionnaireId', $questionnaire->getId());

        return (int) $query->getSingleScalarResult();
    }

    public function getOneForUserAndQuestionnaire(Questionnaire $questionnaire, User $user): ?Reply
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('reply.questionnaire = :questionnaire')
            ->andWhere('reply.author = :user')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('user', $user);

        return $qb->getQuery()->getOneOrNullResult();
    }

    //    public function getByUser(User $user): array
    //    {
    //        $qb = $this->getPublishedQueryBuilder()
    //            ->andWhere('reply.author = :author')
    //            ->setParameter('author', $user);
    //
    //        return $qb->getQuery()->execute();
    //    }

    public function getByAuthorViewerCanSee($viewer, User $user, int $limit, int $offset): array
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('reply.author = :author')
            ->setParameter('author', $user);
        $qb = $qb->setMaxResults($limit)->setFirstResult($offset);

        return $qb->getQuery()->getResult();
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

    public function findByQuestionnaire(
        Questionnaire $questionnaire,
        int $offset,
        int $limit
    ): array {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');

        // Using an ORDER BY "date" will trigger a filesort
        // This make the query too slow for such a huge table
        $nativeQuery = $this->getEntityManager()
            ->createNativeQuery(
                'SELECT r.id FROM reply r USE INDEX (idx_questionnaire_published) WHERE r.published = 1 AND r.questionnaire_id = :questionnaire AND r.is_draft = 0 LIMIT :offset, :limit',
                $rsm
            )
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('offset', $offset)
            ->setParameter('limit', $limit);

        $result = $nativeQuery->execute();
        $ids = array_map(function ($data) {
            return $data['id'];
        }, $result);

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
        bool $excludePrivate = false
    ): Collection {
        $qb = $this->createQueryBuilder('reply')
            ->andWhere('reply.questionnaire = :questionnaire')
            ->andWhere('reply.author = :user')
            ->setParameter('questionnaire', $questionnaire)
            ->setParameter('user', $user);

        if ($excludePrivate) {
            $qb->andWhere('reply.private = :private')->setParameter('private', false);
        }

        return new ArrayCollection($qb->getQuery()->getResult());
    }

    public function getEnabledByQuestionnaireAsArray(Questionnaire $questionnaire): array
    {
        $qb = $this->createQueryBuilder('reply')
            ->andWhere('reply.published = true')
            ->addSelect('author')
            ->leftJoin('reply.author', 'author')
            ->andWhere('reply.questionnaire = :questionnaire')
            ->setParameter('questionnaire', $questionnaire);

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
                array_filter($project->getRealSteps(), function ($step) {
                    return $step instanceof QuestionnaireStep;
                })
            )
            ->setParameter('author', $author);

        return $qb
            ->getQuery()
            ->useQueryCache(true)

            ->getSingleScalarResult();
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
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countRepliesByStep(QuestionnaireStep $step): int
    {
        // TODO: avoid leftJoin here would be better for perf
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(reply)')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->andWhere('questionnaire.step = :step')
            ->setParameter('step', $step);

        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('reply')->andWhere('reply.published = true');
    }

    private function getPublicPublishedNonDraftByAuthorQueryBuilder(User $author): QueryBuilder
    {
        return $this->createQueryBuilder('reply')
            ->andWhere('reply.published = true')
            ->andWhere('reply.author = :author')
            ->andWhere('reply.private = false')
            ->andWhere('reply.draft = false')
            ->setParameter('author', $author);
    }
}
