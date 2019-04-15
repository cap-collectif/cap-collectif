<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\Processor;

use Capco\MediaBundle\Entity\Media;
use Fidry\AliceDataFixtures\ProcessorInterface;

class MediaProcessor implements ProcessorInterface
{
    public function preProcess(string $id, $object): void
    {
        if ($object instanceof Media) {
            $object->setBinaryContent(
                realpath(__DIR__) . '/../files/' . $object->getBinaryContent()
            );
            $object->setEnabled(true);
            $object->setProviderName($this->resolveProviderName($object));
            $object->setContext('default');
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess(string $id, $object): void
    {
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
