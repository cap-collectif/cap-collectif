<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\ReportableInterface;

interface DebateArgumentInterface extends Contribution, VotableInterface, ReportableInterface, Authorable
{
}
