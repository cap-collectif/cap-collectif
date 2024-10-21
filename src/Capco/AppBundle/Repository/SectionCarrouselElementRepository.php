<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Section\SectionCarrouselElement;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SectionCarrouselElement find($id, $lockMode = null, $lockVersion = null)
 * @method null|SectionCarrouselElement findOneBy(array $criteria, array $orderBy = null)
 * @method SectionCarrouselElement[]    findAll()
 * @method SectionCarrouselElement[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 *
 * @extends EntityRepository<SectionCarrouselElement>
 */
class SectionCarrouselElementRepository extends EntityRepository
{
}
