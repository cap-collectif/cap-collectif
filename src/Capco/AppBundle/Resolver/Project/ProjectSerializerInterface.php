<?php

namespace Capco\AppBundle\Resolver\Project;

use JMS\Serializer\Serializer;

interface ProjectSerializerInterface
{
    public function renderProjects(array $projects, bool $withKey = false);

    public function getSerializer(): Serializer;
}
