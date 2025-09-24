<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;

class MediaManager
{
    public const MEDIAS_PATH = '/public/media/default/0001/01/';

    public function __construct(
        private readonly string $projectDir,
        private readonly EntityManagerInterface $em,
        private readonly MediaRepository $mediaRepository,
        private readonly LoggerInterface $logger,
        private readonly Filesystem $filesystem,
    ) {
    }

    public function removeWithFileIfFileExists(Media $media): void
    {
        $fullPath = $this->projectDir . self::MEDIAS_PATH . $media->getProviderReference();

        if (!$this->filesystem->exists($fullPath)) {
            $this->logger->error(sprintf('Aborting Media deletion because the file was not found: %s', $fullPath));

            return;
        }

        $this->em->remove($media);

        try {
            $this->filesystem->remove($fullPath);
        } catch (\Throwable $e) {
            $this->logger->error(sprintf('There was an error while removing the file %s from filesystem (but it has been correctly deleted from the database): %s', $fullPath, $e->getMessage()));
        }
    }

    /**
     * @param string[] $mediaIds
     *
     * @return array<string, array<int, string>>
     */
    public function removeFromIdsWithFiles(array $mediaIds): array
    {
        $medias = $this->mediaRepository->findBy(['id' => $mediaIds]);

        $notFoundIds = array_diff(
            $mediaIds,
            array_map(fn (Media $media) => $media->getId(), $medias)
        );
        $this->logger->error(sprintf('The following media ids were not found: %s', implode(',', $notFoundIds)));

        return $this->bulkRemoveWithFiles($medias);
    }

    /**
     * @param Media[] $medias
     *
     * @return array<string, array<int, string>>
     */
    private function bulkRemoveWithFiles(array $medias): array
    {
        $deletedMediaIds = [];

        foreach ($medias as $media) {
            try {
                $this->em->remove($media);
                $deletedMediaIds[] = $media->getId();
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('The media of id: %s could not be removed from database: %s', $media->getId(), $e->getMessage()));

                continue;
            }

            try {
                $this->filesystem->remove($this->projectDir . self::MEDIAS_PATH . $media->getProviderReference());
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('The file associated with the media of id: %s could not be removed from filesystem: %s', $media->getId(), $e->getMessage()));
            }
        }

        $this->em->flush();

        return [
            'deletedMediaIds' => $deletedMediaIds,
        ];
    }
}
