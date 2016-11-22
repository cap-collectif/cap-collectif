<?php

namespace Capco\AppBundle\Resolver\Project;

use JMS\Serializer\Serializer;

class ProjectSerializer implements ProjectSerializerInterface
{
    protected $serializer;

    public function __construct(Serializer $serializer)
    {
        $this->serializer = $serializer;
    }

    public function renderProjects(array $projects, bool $withKey = false)
    {
        return $withKey ? ['projects' => $projects] : $projects;
    }

    public function getSerializer(): Serializer
    {
        return $this->serializer;
    }
}
