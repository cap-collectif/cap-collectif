<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigTest;

class InstanceOfExtension extends AbstractExtension
{
    public function getTests(): array
    {
        return [
            new TwigTest('instanceof', [$this, 'isInstanceof'])
        ];
    }

    public function isInstanceof($object, $instance): bool
    {
        $reflexionClass = new \ReflectionClass($instance);
        return $reflexionClass->isInstance($object);
    }
}