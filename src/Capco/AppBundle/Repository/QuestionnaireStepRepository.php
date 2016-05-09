<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * QuestionnaireStepRepository.
 */
class QuestionnaireStepRepository extends EntityRepository
{
    /**
     * Get one by slug.
     *
     * @param $slug
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($slug)
    {
        $qb = $this->createQueryBuilder('s')
            ->addSelect('q', 'qaq', 'qt')
            ->leftJoin('s.questionnaire', 'q')
            ->leftJoin('q.questions', 'qaq')
            ->leftJoin('qaq.question', 'qt')
            ->andWhere('s.slug = :slug')
            ->setParameter('slug', $slug);

        return $qb
            ->getQuery()
            ->getOneOrNullResult();
    }
}
