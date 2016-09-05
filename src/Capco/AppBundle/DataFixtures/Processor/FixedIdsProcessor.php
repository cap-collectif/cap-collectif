<?php

namespace Capco\AppBundle\DataFixtures\Processor;

use Nelmio\Alice\ProcessorInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Capco\ClassificationBundle\Entity\Context;
use Doctrine\ORM\EntityManager;

class FixedIdsProcessor implements ProcessorInterface
{
    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function preProcess($object)
    {
        if (!($object instanceof Context) && $object->getId()) {
            $metadata = $this->em->getClassMetaData(get_class($object));
            $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function postProcess($object)
    {
    }
}
