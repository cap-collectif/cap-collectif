<?php

namespace Capco\AppBundle\Behat;

trait PageTrait
{
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

    public function clickOnButton($button)
    {
        $this->getElement($button)->click();
    }

    public function fillElementWithValue(string $element, string $value)
    {
        $this->getElement($element)->setValue($value);
    }

    public function clickOnTab($tab)
    {
        $this->getElement("$tab tab")->click();
    }
}
