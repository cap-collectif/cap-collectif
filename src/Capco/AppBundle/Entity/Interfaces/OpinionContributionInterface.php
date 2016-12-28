<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\IsPublishableInterface;

interface OpinionContributionInterface extends Contribution, TrashableInterface, IsPublishableInterface, VotableInterface
{
    public function getArguments();

    public function getArgumentForCount();

    public function getArgumentAgainstCount();
}
