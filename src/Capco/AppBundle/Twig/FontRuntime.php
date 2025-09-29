<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Font;
use Capco\AppBundle\Repository\FontRepository;
use Twig\Extension\RuntimeExtensionInterface;

class FontRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        private readonly FontRepository $repository
    ) {
    }

    public function getCurrentFont(): array
    {
        return [
            'heading' => $this->repository->getCurrentHeadingFont(),
            'body' => $this->repository->getCurrentBodyFont(),
        ];
    }

    /**
     * @return array|Font[]
     */
    public function getCustomActiveFonts(): array
    {
        return $this->repository->getCustomActiveFonts();
    }

    /**
     * @return array|Font[]
     */
    public function getAllFonts(): array
    {
        return $this->repository->getCustomFonts();
    }
}
