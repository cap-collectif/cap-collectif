<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class FilePathResolver
{
    private readonly string $exportDirectory;

    public function __construct(string $exportDirectory)
    {
        $this->exportDirectory = $exportDirectory;
    }

    public function getSimplifiedExportPath(AbstractStep $step): string
    {
        return $this->exportDirectory . CreateStepContributorsCommand::getFilename($step, true);
    }

    public function getFullExportPath(AbstractStep $step): string
    {
        return $this->exportDirectory . CreateStepContributorsCommand::getFilename($step);
    }
}
