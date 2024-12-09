<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;

class VotesFilePathResolver extends AbstractFilePathResolver
{
    public function getSimplifiedExportPath(AbstractStep $step): string
    {
        return sprintf('%s%s/%s', $this->exportDirectory, $step->getType(), $this->getFileName($step, true));
    }

    public function getFullExportPath(AbstractStep $step): string
    {
        return sprintf('%s%s/%s', $this->exportDirectory, $step->getType(), $this->getFileName($step));
    }

    public function getFileName(AbstractStep $step, bool $simplified = false): string
    {
        $fileName = sprintf(
            'votes_%s_%s',
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
