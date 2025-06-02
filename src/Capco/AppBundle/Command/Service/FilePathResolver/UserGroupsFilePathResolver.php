<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

class UserGroupsFilePathResolver
{
    public function __construct(private readonly string $exportDirectory)
    {
    }

    public function getExportPath(): string
    {
        return sprintf('%suser-groups/%s', $this->exportDirectory, $this->getFileName());
    }

    public function getFileName(): string
    {
        return 'user_groups.csv';
    }
}
