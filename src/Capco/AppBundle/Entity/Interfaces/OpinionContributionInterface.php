<?php
namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Model\IsPublishableInterface;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Model\ModerableInterface;

interface OpinionContributionInterface
    extends Sourceable, Argumentable, Contribution, Publishable, VotableInterface, ModerableInterface
{
    public function canDisplay($user = null): bool;

    public function canContribute();
}
