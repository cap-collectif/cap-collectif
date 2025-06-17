<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;

abstract class AbstractFilePathResolver implements FilePathResolverInterface
{
    public function __construct(protected string $exportDirectory)
    {
    }

    abstract public function getSimplifiedExportPath(AbstractStep $step): string;

    abstract public function getFullExportPath(AbstractStep $step): string;
}
