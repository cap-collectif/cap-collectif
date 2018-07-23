<?php
namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Model\ModerableInterface;
use Capco\UserBundle\Entity\User;

interface OpinionContributionInterface
    extends Sourceable, Argumentable, Contribution, Publishable, VotableInterface, ModerableInterface
{
}
