<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\LocaleRepository;
use Twig\Extension\RuntimeExtensionInterface;

class DefaultLanguageRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        protected LocaleRepository $repo
    ) {
    }

    public function getDefaultLocale(): string
    {
        return $this->repo->getDefaultCode();
    }
}
