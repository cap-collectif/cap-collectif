<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;

abstract class AbstractFilePathResolver
{
    protected string $exportDirectory;

    public function __construct(string $exportDirectory)
    {
        $this->exportDirectory = $exportDirectory;
    }

    abstract public function getSimplifiedExportPath(AbstractStep $step): string;

    abstract public function getFullExportPath(AbstractStep $step): string;
}
