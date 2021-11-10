<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityRepository;

/**
 * @method ReplyAnonymous|null find($id, $lockMode = null, $lockVersion = null)
 * @method ReplyAnonymous|null findOneBy(array $criteria, array $orderBy = null)
 * @method ReplyAnonymous[]    findAll()
 * @method ReplyAnonymous[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class ReplyAnonymousRepository extends EntityRepository
{
    
}
