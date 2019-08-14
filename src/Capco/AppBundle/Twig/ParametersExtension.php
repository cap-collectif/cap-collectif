<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteColor\Resolver as SiteColorResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ParametersExtension extends AbstractExtension
{
    public const CACHE_KEY = 'site-parameters';
    protected $cache;
    protected $router;
    protected $manager;
    protected $translator;
    protected $siteColorResolver;
    protected $siteParameterResolver;

    public function __construct(
        Manager $manager,
        RedisCache $cache,
        RouterInterface $router,
        Resolver $siteParameterResolver,
        TranslatorInterface $translator,
        SiteColorResolver $siteColorResolver
    ) {
        $this->cache = $cache;
        $this->router = $router;
        $this->manager = $manager;
        $this->translator = $translator;
        $this->siteColorResolver = $siteColorResolver;
        $this->siteParameterResolver = $siteParameterResolver;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('is_feature_enabled', [$this, 'getIsFeatureEnabled']),
            new TwigFunction('has_feature_enabled', [$this, 'getHasFeatureEnabled']),
            new TwigFunction('features_list', [$this, 'getFeatures']),
            new TwigFunction('site_parameters_list', [$this, 'getSiteParameters'])
        ];
    }

    public function getIsFeatureEnabled($flag): bool
    {
        return $this->manager->isActive($flag);
    }

    public function getHasFeatureEnabled($flags): bool
    {
        return $this->manager->hasOneActive($flags);
    }

    public function getFeatures(): array
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
                'contact.title',
                'contact.customcode',
                'contact.content.body',
                'contact.metadescription',
                'global.site.organization_name',
                'global.site.communication_from',
                'snalytical-tracking-scripts-on-all-pages',
                'ad-scripts-on-all-pages',
                'cookies-list',
                'privacy-policy',
                'charter.body'
            ];

            $exposedParameters = [];
            foreach ($keys as $key) {
                $value = $this->siteParameterResolver->getValue($key);
                $exposedParameters[$key] = $value && '' !== $value ? $value : null;
            }
            $exposedParameters['signin.cgu.name'] = $this->translator->trans(
                'the-charter',
                [],
                'CapcoAppBundle'
            );
            $exposedParameters['signin.cgu.link'] = $this->router->generate('app_page_show', [
                'slug' => $slug
            ]);

            // Add colors
            $colors = [
                'color.main_menu.bg',
                'color.main_menu.bg_active',
                'color.main_menu.text',
                'color.main_menu.text_hover',
                'color.main_menu.text_active',
                'color.btn.primary.bg',
                'color.btn.primary.text',
                'color.section.bg',
                'color.body.bg'
            ];

            foreach ($colors as $color) {
                $value = $this->siteColorResolver->getValue($color);
                $exposedParameters[$color] = $value && '' !== $value ? $value : null;
            }

            $cachedItem->set($exposedParameters)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
