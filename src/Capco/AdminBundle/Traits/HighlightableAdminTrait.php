<?php

namespace Capco\AdminBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait HighlightableAdminTrait
{
    private function checkHighlighted($entity, $originalEntity = null)
    {
        if (!$entity->isHighlighted()) {
            $entity->setHighlightedAt(null);
            return;
        }

        if ($originalEntity != null && $originalEntity['highlighted']) {
            return;
        }

        $entity->setHighlightedAt(new \DateTime());
    }
}
