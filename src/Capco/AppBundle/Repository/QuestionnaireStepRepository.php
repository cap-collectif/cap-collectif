<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * @method QuestionnaireStep|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionnaireStep|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionnaireStep[]    findAll()
 * @method QuestionnaireStep[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class QuestionnaireStepRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionnaireStep::class);
    }
}
