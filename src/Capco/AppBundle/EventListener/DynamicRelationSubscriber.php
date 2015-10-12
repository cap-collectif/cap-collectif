<?php

namespace Capco\AppBundle\EventListener;

use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Persistence\Event\LoadClassMetadataEventArgs;
use Capco\AppBundle\Entity\Address;


class DynamicRelationSubscriber implements EventSubscriber
{
    private $traits;

    public function __construct(array $traits)
    {
        $this->traits = $traits;
    }

    /**
     * {@inheritDoc}
     */
    public function getSubscribedEvents()
    {
        return array(
            Events::loadClassMetadata,
        );
    }

    /**
     * @param LoadClassMetadataEventArgs $eventArgs
     */
    public function loadClassMetadata(LoadClassMetadataEventArgs $eventArgs)
    {
        $metadata = $eventArgs->getClassMetadata();
        $namingStrategy = $eventArgs
            ->getEntityManager()
            ->getConfiguration()
            ->getNamingStrategy()
        ;

        foreach ($this->traits as $trait => $params)
        {
            switch ($trait)
            {
                case "selflinkable":
                    // Check intersections between current class interfaces and interfaces to add dynamic relation
                    if (count(array_intersect(class_implements($metadata->getName()), $params['interfaces'])) > 0)
                    {
                        $metadata->mapOneToMany([
                            'targetEntity'  => $metadata->getName(),
                            'fieldName'     => 'connections',
                            'cascade'       => ['persist'],
                            'mappedBy'      => 'link',
                        ]);

                        $metadata->mapManyToOne([
                            'targetEntity'  => $metadata->getName(),
                            'fieldName'     => 'link',
                            'cascade'       => ['persist'],
                            'inversedBy'      => ['connections'],
                        ]);
                    }
                    break;
            }

        }
    }
}
