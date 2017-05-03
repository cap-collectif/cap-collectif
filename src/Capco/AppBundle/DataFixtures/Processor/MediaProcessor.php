<?php

namespace Capco\AppBundle\DataFixtures\Processor;

use Capco\MediaBundle\Entity\Media;
use Nelmio\Alice\ProcessorInterface;

class MediaProcessor implements ProcessorInterface
{
    public function preProcess($object)
    {
        if ($object instanceof Media) {
            $object->setBinaryContent(realpath(__DIR__) . '/../files/' . $object->getBinaryContent());
            $object->setEnabled(true);
            $object->setProviderName($this->resolveProviderName($object));
            $object->setContext('default');

            return $object;
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess($object)
    {
    }

    protected function resolveProviderName(Media $media): string
    {
        return in_array(pathinfo($media->getBinaryContent(), PATHINFO_EXTENSION), ['png', 'jpeg', 'jpg', 'bmp', 'gif', 'tiff'], true)
            ? 'sonata.media.provider.image'
            : 'sonata.media.provider.file';
    }
}
