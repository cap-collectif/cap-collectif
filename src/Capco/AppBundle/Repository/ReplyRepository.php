<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class ReplyRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function countPublishedForQuestionnaire(Questionnaire $questionnaire): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(reply.id) as repliesCount')
            ->leftJoin('reply.questionnaire', 'questionnaire')
            ->andWhere('questionnaire.id = :questionnaireId')
            ->setParameter('questionnaireId', $questionnaire->getId());

        return $qb->getQuery()->getSingleScalarResult();
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

    public function getByUser(User $user): array
    {
        $qb = $this->getPublishedQueryBuilder()
            ->andWhere('reply.author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->execute();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('r');
        $qb
            ->select('count(DISTINCT r)')
            ->andWhere('r.author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
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
}
