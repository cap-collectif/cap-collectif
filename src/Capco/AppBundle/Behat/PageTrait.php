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

    public function getSelector($name)
    {
        if (isset($this->elements[$name])) {
            return $this->elements[$name];
        }

        throw new \Exception(sprintf('"%s" not found in array', $name));
    }
}
