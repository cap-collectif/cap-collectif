<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class FilePathResolver
{
    public function __construct(private readonly string $exportDirectory)
    {
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
