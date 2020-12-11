<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Model\ReportableInterface;
use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;

interface OpinionContributionInterface extends
    Sourceable,
    Argumentable,
    Contribution,
    Publishable,
    VotableInterface,
    ReportableInterface
{
}
