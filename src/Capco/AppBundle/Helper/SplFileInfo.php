<?php

namespace Capco\AppBundle\Helper;

use Symfony\Component\Finder\SplFileInfo as BaseSplFileInfo;

class SplFileInfo
{
    /**
     * @var BaseSplFileInfo
     */
    public BaseSplFileInfo $file;

    /**
     * Builds a file.
     *
     * @param string $fileName
     * @param string $relativePath
     * @param string $relativePathname
     *
     * @return self
     */
    public function buildFile(string $fileName, string $relativePath = '', string $relativePathname = ''): self
    {
        $this->file = new BaseSplFileInfo($fileName, $relativePath, $relativePathname);

        return $this;
    }

    /**
     * Gets the file contents.
     *
     * @return string
     */
    public function getContents(): string
    {
        return $this->file->getContents();
    }
}
