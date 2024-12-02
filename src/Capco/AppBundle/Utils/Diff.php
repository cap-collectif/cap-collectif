<?php

namespace Capco\AppBundle\Utils;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Diff
{
    /**
     * Given two collections of elements that have an ID, returns the ones that are missing from the first.
     */
    public static function fromCollectionsWithId(Collection $a, Collection $b): Collection
    {
        $withId = static fn ($entity) => \is_array($entity) ? isset($entity['id']) : (bool) $entity->getId();
        $getId = static fn ($entity) => \is_array($entity) ? $entity['id'] : $entity->getId();
        $idsFromA = $a->filter($withId)->map($getId);
        $idsFromB = $b->filter($withId)->map($getId);
        $deletedIds = array_diff($idsFromA->toArray(), $idsFromB->toArray());

        return new ArrayCollection(
            array_values(
                array_map(static fn ($id) => $a
                    ->filter(static fn ($entity) => (\is_array($entity) ? $entity['id'] : $entity->getId()) === $id)
                    ->first(), $deletedIds)
            )
        );
    }
}
