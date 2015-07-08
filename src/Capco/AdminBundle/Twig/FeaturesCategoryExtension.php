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
        return array(
            new \Twig_SimpleFunction('is_category_enabled', array($this, 'isCategoryEnabled')),
            new \Twig_SimpleFunction('is_admin_enabled', array($this, 'isAdminEnabled')),
            new \Twig_SimpleFunction('get_enabled_pages_categories', array($this, 'getEnabledPagesCategories')),
            new \Twig_SimpleFunction('get_enabled_settings_categories', array($this, 'getEnabledSettingsCategories')),
        );
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
     * @param AdminInterface $admin
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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_admin_features';
    }
}
