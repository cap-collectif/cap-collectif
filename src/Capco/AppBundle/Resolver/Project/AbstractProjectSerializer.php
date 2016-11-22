<?php

namespace Capco\AppBundle\Resolver\Project;

abstract class AbstractProjectSerializer
{
    protected $wrapped;
    protected $outputFormat;
    protected $serializeGroups = ['Projects', 'Steps', 'ThemeDetails'];
    protected $serializeKey = 'projects';

    public function __construct(ProjectSerializerInterface $wrapped)
    {
        $this->wrapped = $wrapped;
    }
}
