<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

class UsersFilePathResolver
{
    private readonly string $exportDirectory;

    public function __construct(string $exportDirectory)
    {
        $this->exportDirectory = $exportDirectory;
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
