<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\ProjectRepository;

class ThemeExtension extends \Twig_Extension
{
    protected $themeRepo;
    protected $projectRepo;

    public function __construct(ThemeRepository $themeRepo, ProjectRepository $projectRepo)
    {
        $this->themeRepo = $themeRepo;
        $this->projectRepo = $projectRepo;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('list_projects', [$this, 'listProjects']),
            new \Twig_SimpleFunction('themes_list', [$this, 'listThemes']),
        ];
    }

    public function listProjects()
    {
        $projects = $this->projectRepo->findAll();
        return $projects;
    }

    public function listThemes()
    {
        $themes = $this->themeRepo->findBy(['isEnabled' => true]);
        $list = [];
        foreach ($themes as $theme) {
            $list[] = ['id' => $theme->getId(), 'title' => $theme->getTitle(), 'slug' => $theme->getSlug()];
        }

        return $list;
    }
}
