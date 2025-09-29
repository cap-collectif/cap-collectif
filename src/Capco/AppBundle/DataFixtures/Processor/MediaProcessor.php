<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\Processor;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Fidry\AliceDataFixtures\ProcessorInterface;
use Liip\ImagineBundle\Service\FilterService;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Process\Process;

/**
 * This processor generate our medias with liip, to display in development
 * images on the first page load and not the second.
 */
class MediaProcessor implements ProcessorInterface
{
    // TODO: Please investigate why this is slow since SF4.
    final public const ENABLE_PROCESSOR = true;
    private array $referenceMap = [];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FilterService $filterService,
        private readonly MediaProvider $mediaProvider,
        private readonly string $projectDir
    ) {
    }

    public function preProcess(string $id, $object): void
    {
        if ($object instanceof Media) {
            $this->referenceMap[$id] = $object->getProviderReference();

            $object->setContext('default');

            $object->setBinaryContentPath(
                $this->projectDir . '/fixtures/files/' . $object->getBinaryContentPath()
            );

            $binaryContent = new File($object->getBinaryContentPath());
            $object->setContentType($binaryContent->getMimeType());
            $object->setSize($binaryContent->getSize());
            $object->setBinaryContent($binaryContent);
            $object->setEnabled(true);
            $object->setProviderName(MediaProvider::class);
            $object->setProviderReference(
                $object->getProviderReference() ?: $this->mediaProvider->generateName($object)
            );

            $this->mediaProvider->writeBinaryContentInFile($object);
            if ($object->isImage()) {
                $this->generateFormats($object);
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess(string $id, $object): void
    {
        if (!self::ENABLE_PROCESSOR) {
            return;
        }
        if ($object instanceof Media) {
            $newProviderReference = $this->referenceMap[$id];
            if (
                !empty($newProviderReference)
                && $newProviderReference !== $object->getProviderReference()
            ) {
                Process::fromShellCommandline(
                    'mv /var/www/public/media/default/0001/01/' .
                        $object->getProviderReference() .
                        ' /var/www/public/media/default/0001/01/' .
                        $newProviderReference
                )->mustRun();

                // Restore providerReference in fixtures
                $object->setProviderReference($newProviderReference);
                if ($object->isImage()) {
                    $this->generateFormats($object);
                }

                // Flush new provider reference
                $this->em->flush();
            }
        }
    }

    // Let's generate cache for images in all formats, to avoid "/resolve" in first URL generation
    protected function generateFormats(Media $media): void
    {
        foreach (['default_logo', 'default_avatar', 'default_project'] as $format) {
            if ('svg' === pathinfo((string) $media->getProviderReference())['extension']) {
                continue;
            }
            $this->filterService->getUrlOfFilteredImage(
                'default/0001/01/' . $media->getProviderReference(),
                $format
            );
        }
    }
}
