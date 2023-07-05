<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\LocaleRepository;
use Twig\Extension\RuntimeExtensionInterface;

class DefaultLanguageRuntime implements RuntimeExtensionInterface
{
    protected LocaleRepository $repo;

    public function __construct(LocaleRepository $repo)
    {
        $this->repo = $repo;
    }

    public function getDefaultLocale(): string
    {
        return $this->repo->getDefaultCode();
    }
}
