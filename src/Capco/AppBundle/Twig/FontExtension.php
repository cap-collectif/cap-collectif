<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Font;
use Capco\AppBundle\Repository\FontRepository;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FontExtension extends AbstractExtension
{
    /**
     * @var FontRepository
     */
    private $repository;

    public function __construct(FontRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('current_font', [$this, 'getCurrentFont']),
            new TwigFunction('active_custom_fonts', [$this, 'getCustomActiveFonts']),
            new TwigFunction('all_custom_fonts', [$this, 'getAllFonts'])
        ];
    }

    public function getCurrentFont(): array
    {
        return [
            'heading' => $this->repository->getCurrentHeadingFont(),
            'body' => $this->repository->getCurrentBodyFont()
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
