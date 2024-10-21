<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Section\SectionTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SectionTranslation find($id, $lockMode = null, $lockVersion = null)
 * @method null|SectionTranslation findOneBy(array $criteria, array $orderBy = null)
 * @method SectionTranslation[]    findAll()
 * @method SectionTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SectionTranslationRepository extends EntityRepository
{
}
