<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\IsPublishableInterface;
use Capco\AppBundle\Model\ModerableInterface;

interface OpinionContributionInterface extends Contribution, IsPublishableInterface, VotableInterface, ModerableInterface
{
    public function getArguments();

    public function getArgumentForCount();

    public function getArgumentAgainstCount();
}
