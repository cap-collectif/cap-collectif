<?php

namespace Capco\AppBundle\Command\Service\FilePathResolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;

interface FilePathResolverInterface
{
    public function getSimplifiedExportPath(AbstractStep $step): string;

    public function getFullExportPath(AbstractStep $step): string;
}
