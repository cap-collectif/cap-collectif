<?php

namespace Capco\AppBundle\Behat;

trait PageTrait
{
    /**
     * @param $element
     *
     * @return bool
     */
    public function containsElement($element)
    {
        return $this->hasElement($element);
    }
}
