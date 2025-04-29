<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpKernel\KernelInterface;

class MediaManager
{
    public const MEDIAS_PATH = '/public/media/default/0001/01/';

    private readonly string $rootPath;

    public function __construct(
        private readonly KernelInterface $kernel,
        private readonly EntityManagerInterface $em,
    ) {
        $this->rootPath = $this->kernel->getProjectDir() . self::MEDIAS_PATH;
    }

    public function removeFromFilesystem(?Media $media = null): void
    {
        if (!$media) {
            return;
        }

        $filesystem = new Filesystem();
        $filename = $media->getProviderReference();

        $fullPath = $this->rootPath . $filename;

        if (!$filesystem->exists($fullPath)) {
            return;
        }
        $filesystem->remove($fullPath);
        $this->em->remove($media);
        $this->em->flush();
    }
}
