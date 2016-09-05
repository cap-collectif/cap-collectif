<?php

namespace Capco\AppBundle\DataFixtures\Processor;

use Nelmio\Alice\ProcessorInterface;
use Capco\MediaBundle\Entity\Media;

class MediaProcessor implements ProcessorInterface
{
    public function preProcess($object)
    {
        if ($object instanceof Media) {
            $object->setBinaryContent(realpath(dirname(__FILE__)).'/../files/'.$object->getBinaryContent());
            $object->setEnabled(true);
            $object->setProviderName('sonata.media.provider.image');
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
}
