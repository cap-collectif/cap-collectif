<?php

namespace Capco\AppBundle\DataFixtures\Processor;

use Nelmio\Alice\ProcessorInterface;
use Capco\MediaBundle\Entity\Media;
use Capco\ClassificationBundle\Entity\Context;

class MediaProcessor implements ProcessorInterface
{
    public function __construct($em)
    {
        $this->em = $em;
    }

    public function preProcess($object)
    {
        if ($object instanceof Media) {
            $object->setBinaryContent(realpath(dirname(__FILE__)).'/../files/'.$object->getBinaryContent());
            $object->setEnabled(true);
            $object->setProviderName('sonata.media.provider.image');
            $object->setContext('default');
            return $object;
        }
        if (!($object instanceof Context) && $object->getId()) {
          $metadata = $this->em->getClassMetaData(get_class($object));
          $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess($object)
    {
      
    }
}
