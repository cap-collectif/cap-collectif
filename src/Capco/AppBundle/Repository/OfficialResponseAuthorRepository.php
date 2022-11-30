<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OfficialResponseAuthor;
use Doctrine\ORM\EntityRepository;

/**
 * @method OfficialResponseAuthor|null find($id, $lockMode = null, $lockVersion = null)
 * @method OfficialResponseAuthor|null findOneBy(array $criteria, array $orderBy = null)
 * @method OfficialResponseAuthor[]    findAll()
 * @method OfficialResponseAuthor[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OfficialResponseAuthorRepository extends EntityRepository
{
}
