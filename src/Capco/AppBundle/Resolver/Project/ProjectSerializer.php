<?php

namespace Capco\AppBundle\Resolver\Project;

use JMS\Serializer\Serializer;
use JMS\Serializer\SerializerInterface;

class ProjectSerializer implements ProjectSerializerInterface
{
    /** @var Serializer */
    protected $serializer;

    public function __construct(SerializerInterface $serializer)
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
