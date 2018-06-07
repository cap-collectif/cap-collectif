<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Repository\PositionableRepository;
use Capco\AppBundle\Toggle\Manager;

class PositionableResolver
{
    protected $repository;
    protected $toggleManager;

    public function __construct(PositionableRepository $repository, Manager $toggleManager)
    {
        $this->repository = $repository;
        $this->toggleManager = $toggleManager;
    }

    /**
     * @return array
     */
    public function getDisplayableOrdered()
    {
        $all = $this->repository->getAllOrderedByPosition();
        $objects = [];
        foreach ($all as $object) {
            if ($this->toggleManager->containsEnabledFeature($object->getAssociatedFeatures())) {
                $objects[] = $object;
            }
        }

        return $objects;
    }

    /**
     * @return array
     */
    public function getDisplayableEnabledOrdered()
    {
        $all = $this->repository->getEnabledOrderedByPosition();
        $objects = [];
        foreach ($all as $object) {
            if ($this->toggleManager->containsEnabledFeature($object->getAssociatedFeatures())) {
                $objects[] = $object;
            }
        }

        return $objects;
    }

    /**
     * @param $reference
     * @param $relPos
     */
    public function getObjectToSwitch($reference, $relPos)
    {
        $objects = $this->getDisplayableOrdered();
        foreach ($objects as $index => $object) {
            if ($object === $reference) {
                return $objects[$index + $relPos];
            }
        }
    }

    /**
     * @param $object
     *
     * @return bool
     */
    public function isFirst($object)
    {
        $objects = $this->getDisplayableOrdered();
        if (\count($objects) > 0) {
            return $object === $objects[0];
        }

        return false;
    }

    /**
     * @param $object
     *
     * @return bool
     */
    public function isLast($object)
    {
        $objects = $this->getDisplayableOrdered();
        if (\count($objects) > 0) {
            return $object === $objects[\count($objects) - 1];
        }

        return false;
    }
}
