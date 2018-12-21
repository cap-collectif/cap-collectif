<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\SiteColor\Resolver as SiteColorResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Router;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\Cache\RedisCache;

class ParametersExtension extends \Twig_Extension
{
    public const CACHE_KEY = 'site-parameters';
    protected $manager;
    protected $siteParameterResolver;
    protected $translator;
    protected $router;
    protected $siteColorResolver;
    protected $cache;

    public function __construct(
        Manager $manager,
        Resolver $siteParameterResolver,
        TranslatorInterface $translator,
        Router $router,
        SiteColorResolver $siteColorResolver,
        RedisCache $cache
    ) {
        $this->manager = $manager;
        $this->siteParameterResolver = $siteParameterResolver;
        $this->translator = $translator;
        $this->router = $router;
        $this->siteColorResolver = $siteColorResolver;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('is_feature_enabled', [$this, 'getIsFeatureEnabled']),
            new \Twig_SimpleFunction('has_feature_enabled', [$this, 'getHasFeatureEnabled']),
            new \Twig_SimpleFunction('features_list', [$this, 'getFeatures']),
            new \Twig_SimpleFunction('site_parameters_list', [$this, 'getSiteParameters']),
        ];
    }

    public function getIsFeatureEnabled($flag)
    {
        return $this->manager->isActive($flag);
    }

    public function getHasFeatureEnabled($flags)
    {
        return $this->manager->hasOneActive($flags);
    }

    public function getFeatures()
    {
        return $this->manager->all();
    }

    public function getSiteParameters(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY);

        if (!$cachedItem->isHit()) {
            $slug = strtolower($this->translator->trans('charter', [], 'CapcoAppBundle'));
            $keys = [
                'login.text.top',
                'login.text.bottom',
                'global.site.organization_name',
                'snalytical-tracking-scripts-on-all-pages',
                'ad-scripts-on-all-pages',
            ];

            $exposedParameters = [];
            foreach ($keys as $key) {
                $value = $this->siteParameterResolver->getValue($key);
                $exposedParameters[$key] = $value && \strlen($value) > 0 ? $value : null;
            }
            $exposedParameters['signin.cgu.name'] = $this->translator->trans(
                'the-charter',
                [],
                'CapcoAppBundle'
            );
            $exposedParameters['signin.cgu.link'] = $this->router->generate('app_page_show', [
                'slug' => $slug,
            ]);

            // Add colors
            $colors = ['color.btn.primary.bg', 'color.btn.primary.text'];

            foreach ($colors as $color) {
                $value = $this->siteColorResolver->getValue($color);
                $exposedParameters[$color] = $value && \strlen($value) > 0 ? $value : null;
            }

            $cachedItem->set($exposedParameters)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
