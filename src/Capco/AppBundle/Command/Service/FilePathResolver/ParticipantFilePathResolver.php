<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class ParticipantFilePathResolver extends AbstractFilePathResolver
{
    public function __construct(protected string $exportDirectory)
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

    public function getFileName(string $dataType, AbstractStep $step, bool $simplified = false): string
    {
        $fileName = sprintf(
            '%s_%s_%s',
            $dataType,
            $step->getProject()
                ? $step->getProject()->getSlug()
                : $step->getId(),
            $step->getSlug()
        );

        if (\strlen($fileName) >= 230) {
            $fileName = md5($fileName);
        }

        if ($simplified) {
            $fileName .= '_simplified';
        }

        return $fileName . '.csv';
    }
}
