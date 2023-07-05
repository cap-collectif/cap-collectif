<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ContactForm\ContactFormTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ContactFormTranslation find($id, $lockMode = null, $lockVersion = null)
 * @method null|ContactFormTranslation findOneBy(array $criteria, array $orderBy = null)
 * @method ContactFormTranslation[]    findAll()
 * @method ContactFormTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContactFormTranslationRepository extends EntityRepository
{
}
