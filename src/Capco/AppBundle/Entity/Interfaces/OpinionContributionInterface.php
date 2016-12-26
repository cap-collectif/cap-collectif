<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Doctrine\Common\Collections\Collection;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Entity\Interfaces\TrashableInterface;
use Capco\AppBundle\Model\IsPublishableInterface;

interface OpinionContributionInterface extends Contribution, TrashableInterface, IsPublishableInterface, VotableInterface
{
    public function getArguments();
    public function getArgumentForCount();
    public function getArgumentAgainstCount();
}
