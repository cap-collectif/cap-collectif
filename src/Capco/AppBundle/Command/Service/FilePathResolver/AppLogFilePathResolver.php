<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

class AppLogFilePathResolver
{
    public function __construct(
        private readonly string $exportDirectory
    ) {
    }

    public function getExportPath(): string
    {
        return sprintf('%sapp_logs/%s', $this->exportDirectory, $this->getFileName());
    }

    public function getFileName(): string
    {
        return 'app_logs.csv';
    }
}
