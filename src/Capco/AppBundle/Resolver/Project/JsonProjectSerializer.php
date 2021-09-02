<?php

namespace Capco\AppBundle\Resolver\Project;

use JMS\Serializer\SerializationContext;

class JsonProjectSerializer extends AbstractProjectSerializer
{
    protected $outputFormat = 'json';

    public function renderProjects(array $projects, bool $withKey = false): ?string
    {
        return $this->wrapped
            ->getSerializer()
            ->serialize(
                $withKey ? [$this->serializeKey => $projects] : $projects,
                $this->outputFormat,
                SerializationContext::create()->setGroups($this->serializeGroups)
            );
    }
}
