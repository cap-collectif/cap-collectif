<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ThemeTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ThemeTranslation find($id, $lockMode = null, $lockVersion = null)
 * @method null|ThemeTranslation findOneBy(array $criteria, array $orderBy = null)
 * @method ThemeTranslation[]    findAll()
 * @method ThemeTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ThemeTranslationRepository extends EntityRepository
{
}
