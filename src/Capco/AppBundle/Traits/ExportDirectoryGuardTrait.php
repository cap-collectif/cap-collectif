<?php

namespace Capco\AppBundle\Traits;

trait ExportDirectoryGuardTrait
{
    protected function ensureExportDirectory(string $filePath): void
    {
        $directory = \dirname($filePath);

        if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
            throw new \RuntimeException(sprintf('Cannot create export directory: %s', $directory));
        }
    }

    /**
     * @param array<string, string> $filePaths
     */
    protected function ensureExportDirectories(array $filePaths): void
    {
        foreach ($filePaths as $filePath) {
            $this->ensureExportDirectory($filePath);
        }
    }
}
