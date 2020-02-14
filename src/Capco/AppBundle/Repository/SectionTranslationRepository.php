<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SectionTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method SectionTranslation|null find($id, $lockMode = null, $lockVersion = null)
 * @method SectionTranslation|null findOneBy(array $criteria, array $orderBy = null)
 * @method SectionTranslation[]    findAll()
 * @method SectionTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SectionTranslationRepository extends EntityRepository
{
}
