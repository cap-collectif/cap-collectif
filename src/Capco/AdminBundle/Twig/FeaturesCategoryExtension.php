<?php

namespace Capco\AdminBundle\Twig;

use Capco\AdminBundle\Resolver\FeaturesCategoryResolver;

class FeaturesCategoryExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(FeaturesCategoryResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('is_category_enabled', [$this, 'isCategoryEnabled']),
            new \Twig_SimpleFunction('is_admin_enabled', [$this, 'isAdminEnabled']),
            new \Twig_SimpleFunction('get_enabled_pages_categories', [$this, 'getEnabledPagesCategories']),
            new \Twig_SimpleFunction('get_enabled_settings_categories', [$this, 'getEnabledSettingsCategories']),
        ];
    }

    /**
     * @param $category
     *
     * @return bool
     */
    public function isCategoryEnabled($category)
    {
        return $this->resolver->isCategoryEnabled($category);
    }

    /**
     * @param mixed $admin
     *
     * @return bool
     */
    public function isAdminEnabled($admin)
    {
        return $this->resolver->isAdminEnabled($admin);
    }

    /**
     * Return enabled categories for pages group.
     *
     * @return array
     */
    public function getEnabledPagesCategories()
    {
        return $this->resolver->getEnabledPagesCategories();
    }

    /**
     * Return enabled categories for settings group.
     *
     * @return array
     */
    public function getEnabledSettingsCategories()
    {
        return $this->resolver->getEnabledSettingsCategories();
    }
}
