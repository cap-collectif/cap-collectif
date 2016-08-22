<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\ThemeRepository;

class ThemeExtension extends \Twig_Extension
{
    protected $themeRepo;

    public function __construct(ThemeRepository $themeRepo)
    {
        $this->themeRepo = $themeRepo;
    }

    public function getName() : string
    {
        return 'capco_theme';
    }

    public function getFunctions() : array
    {
        return [
            new \Twig_SimpleFunction('themes_list', [$this, 'listThemes']),
        ];
    }

    public function listThemes()
    {
        $themes = $this->themeRepo->findBy(['isEnabled' => true]);
        $list = [];
        foreach ($themes as $theme) {
            $list[] = ['id' => $theme->getId(), 'title' => $theme->getTitle()];
        }

        return $list;
    }
}
