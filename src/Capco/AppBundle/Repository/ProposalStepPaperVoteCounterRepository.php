<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Doctrine\ORM\EntityRepository;

/**
 * @method ProposalStepPaperVoteCounter|null find($id, $lockMode = null, $lockVersion = null)
 * @method ProposalStepPaperVoteCounter|null findOneBy(array $criteria, array $orderBy = null)
 * @method ProposalStepPaperVoteCounter[]    findAll()
 * @method ProposalStepPaperVoteCounter[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ProposalStepPaperVoteCounterRepository extends EntityRepository
{
}
