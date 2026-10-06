<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\HubMetadata;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityRepository;

class HubMetadataRepository extends EntityRepository
{
    public function findOneByProject(Project $project): ?HubMetadata
    {
        return $this->findOneBy(['project' => $project]);
        // @var null|HubMetadata $hubMetadata
    }
}
