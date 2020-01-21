<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\ORM\EntityRepository;

/**
 * @method MenuItem findOneByLink(string $link)
 */
class MenuItemTranslationRepository extends EntityRepository
{
}
