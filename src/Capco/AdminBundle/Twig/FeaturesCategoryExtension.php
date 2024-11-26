<?php

namespace Capco\AdminBundle\Twig;

use Capco\AdminBundle\Resolver\FeaturesCategoryResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FeaturesCategoryExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(FeaturesCategoryResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions()
    {
        return [
            new TwigFunction('is_category_enabled', $this->isCategoryEnabled(...)),
            new TwigFunction('is_admin_enabled', $this->isAdminEnabled(...)),
            new TwigFunction('get_enabled_pages_categories', $this->getEnabledPagesCategories(...)),
            new TwigFunction('get_enabled_settings_categories', $this->getEnabledSettingsCategories(...)),
        ];
    }

    public function isCategoryEnabled(string $category): bool
    {
        return $this->resolver->isCategoryEnabled($category);
    }

    public function isAdminEnabled($admin): bool
    {
        return $this->resolver->isAdminEnabled($admin);
    }

    public function getEnabledPagesCategories(): array
    {
        return $this->resolver->getEnabledPagesCategories();
    }

    public function getEnabledSettingsCategories(): array
    {
        return $this->resolver->getEnabledSettingsCategories();
    }
}
