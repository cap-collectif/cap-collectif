<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Traits\UuidTrait;
use Knp\DoctrineBehaviors\Model\Translatable\Translatable;

/**
 * Should be used inside translatable entity.
 */
trait TranslatableTrait
{
    use Translatable;
}
