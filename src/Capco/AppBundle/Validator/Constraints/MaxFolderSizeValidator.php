<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Manager\MediaManager;
use Psr\Log\LoggerInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use TusPhp\File;

class MaxFolderSizeValidator extends ConstraintValidator
{
    public function __construct(
        private readonly int $maxSize,
        private readonly string $projectDir,
        private readonly Finder $finder,
        private readonly LoggerInterface $logger
    ) {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof MaxFolderSize) {
            throw new UnexpectedTypeException($constraint, MaxFolderSize::class);
        }

        if (
            !$value instanceof UploadedFile
            && !$value instanceof File
        ) {
            throw new \InvalidArgumentException(sprintf('The value must be an instance of "%s" or "%s"', UploadedFile::class, File::class));
        }

        $uploadedFileSize = $value instanceof UploadedFile ? $value->getSize() : $value->getFileSize();

        $totalSize = $this->getMediaFolderSize() + $uploadedFileSize;

        if ($totalSize > $this->maxSize) {
            $this->context->buildViolation($constraint->message)
                ->addViolation()
            ;

            $this->logger->error(sprintf('The size of the folder %s exceeds the allowed limit of %s.', MediaManager::formatBytes($totalSize), MediaManager::formatBytes($this->maxSize)));
        }
    }

    private function getMediaFolderSize(): int
    {
        $this->finder->files()->depth('== 0')->in(sprintf('%s/public/media/default/0001/01/', $this->projectDir));

        $totalSize = 0;

        foreach ($this->finder as $file) {
            $fileSize = $file->getSize();

            if (false === $fileSize) {
                continue;
            }

            $totalSize += $fileSize;
        }

        return $totalSize;
    }
}
