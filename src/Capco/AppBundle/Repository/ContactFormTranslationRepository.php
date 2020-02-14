<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ContactForm\ContactFormTranslation;
use Doctrine\ORM\EntityRepository;

/**
 * @method ContactFormTranslation|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContactFormTranslation|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContactFormTranslation[]    findAll()
 * @method ContactFormTranslation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContactFormTranslationRepository extends EntityRepository
{
}
