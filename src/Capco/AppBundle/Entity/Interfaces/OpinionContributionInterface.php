<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\IsPublishableInterface;
use Capco\AppBundle\Model\ModerableInterface;

interface OpinionContributionInterface extends Argumentable, Contribution, IsPublishableInterface, VotableInterface, ModerableInterface
{
}
