<?php

namespace Capco\AppBundle\Helper;

use Symfony\Component\Finder\SplFileInfo as BaseSplFileInfo;

class SplFileInfo
{
    public BaseSplFileInfo $file;

    /**
     * Builds a file.
     */
    public function buildFile(string $fileName, string $relativePath = '', string $relativePathname = ''): self
    {
        $this->file = new BaseSplFileInfo($fileName, $relativePath, $relativePathname);

        return $this;
    }

    /**
     * Gets the file contents.
     */
    public function getContents(): string
    {
        return $this->file->getContents();
    }
}
