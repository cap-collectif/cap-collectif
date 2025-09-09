<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;

class VotesFilePathResolver extends AbstractFilePathResolver
{
    public function getSimplifiedExportPath(AbstractStep $step): string
    {
        return sprintf('%s%s/%s', $this->exportDirectory, $step->getType(), $this->getFileName($step, ExportVariantsEnum::SIMPLIFIED));
    }

    public function getFullExportPath(AbstractStep $step): string
    {
        return sprintf('%s%s/%s', $this->exportDirectory, $step->getType(), $this->getFileName($step, ExportVariantsEnum::FULL));
    }

    public function getGroupedExportPath(AbstractStep $step): string
    {
        return '';
    }

    public function getFileName(AbstractStep $step, ExportVariantsEnum $variant): string
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

        $fileNameSuffix = ExportVariantsEnum::getFileSuffix($variant);

        $fileName .= $fileNameSuffix;

        return $fileName . '.csv';
    }
}
