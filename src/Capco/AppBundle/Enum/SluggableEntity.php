<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;

final class SluggableEntity
{
    public const ORGANIZATION = Organization::class;
    public const DISTRICT = GlobalDistrict::class;
    public const PROPOSAL_DISTRICT = ProposalDistrict::class;
    public const PAGE = Page::class;
    public const PROJECT = Project::class;
    public const STEP = AbstractStep::class;
}
