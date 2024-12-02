<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

class UsersFilePathResolver
{
    public function __construct(private readonly string $exportDirectory)
    {
    }

    public function getExportPath(): string
    {
        return sprintf('%susers/%s', $this->exportDirectory, $this->getFileName());
    }

    public function getFileName(): string
    {
        return 'users.csv';
    }
}
