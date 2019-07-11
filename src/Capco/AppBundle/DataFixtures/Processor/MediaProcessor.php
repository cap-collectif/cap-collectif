<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\Processor;

use Capco\MediaBundle\Entity\Media;
use Fidry\AliceDataFixtures\ProcessorInterface;
use Sonata\ClassificationBundle\Model\ContextInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Process\Process;
use Liip\ImagineBundle\Service\FilterService;

class MediaProcessor implements ProcessorInterface
{
    private $referenceMap = [];
    private $em;
    private $filterService;

    public function __construct(EntityManagerInterface $em, FilterService $filterService)
    {
        $this->em = $em;
        $this->filterService = $filterService;
    }

    public function preProcess(string $id, $object): void
    {
        if ($object instanceof Media) {
            $this->referenceMap[$id] = $object->getProviderReference();

            $object->setContext(ContextInterface::DEFAULT_CONTEXT);

            // This will reset the providerReference
            $object->setBinaryContent(
                realpath(__DIR__) . '/../files/' . $object->getBinaryContent()
            );

            $object->setEnabled(true);
            $object->setProviderName($this->resolveProviderName($object));
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess(string $id, $object): void
    {
        if ($object instanceof Media) {
            $newProviderReference = $this->referenceMap[$id];
            if (
                !empty($newProviderReference) &&
                $newProviderReference !== $object->getProviderReference()
            ) {
                (new Process(
                    'mv /var/www/web/media/default/0001/01/' .
                        $object->getProviderReference() .
                        ' /var/www/web/media/default/0001/01/' .
                        $newProviderReference
                ))->mustRun();

                // Restore providerReference in fixtures
                $object->setProviderReference($newProviderReference);

                // Let's generate cache for all medias in all formats, to avoid "/resolve" in first URL generation
                $imgFormats = ['default_logo', 'default_avatar'];
                foreach ($imgFormats as $format) {
                    // Will generate cache file
                    if (!strpos($newProviderReference, '.pdf')) {
                        $this->filterService->getUrlOfFilteredImage(
                            'default/0001/01/' . $newProviderReference,
                            $format
                        );
                    }
                }

                // Flush new provider reference
                $this->em->flush();
            }
        }
    }

    protected function resolveProviderName(Media $media): string
    {
        return \in_array(
            pathinfo($media->getBinaryContent(), PATHINFO_EXTENSION),
            ['png', 'jpeg', 'jpg', 'bmp', 'gif', 'tiff'],
            true
        )
            ? 'sonata.media.provider.image'
            : 'sonata.media.provider.file';
    }
}
