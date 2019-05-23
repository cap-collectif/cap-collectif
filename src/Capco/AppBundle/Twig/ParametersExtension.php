<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteColor\Resolver as SiteColorResolver;

class ParametersExtension extends \Twig_Extension
{
    public const CACHE_KEY = 'site-parameters';
    protected $cache;
    protected $router;
    protected $manager;
    protected $translator;
    protected $mediaExtension;
    protected $siteColorResolver;
    protected $siteParameterResolver;

    public function __construct(
        Manager $manager,
        RedisCache $cache,
        RouterInterface $router,
        MediaExtension $mediaExtension,
        Resolver $siteParameterResolver,
        TranslatorInterface $translator,
        SiteColorResolver $siteColorResolver
    ) {
        $this->cache = $cache;
        $this->router = $router;
        $this->manager = $manager;
        $this->translator = $translator;
        $this->mediaExtension = $mediaExtension;
        $this->siteColorResolver = $siteColorResolver;
        $this->siteParameterResolver = $siteParameterResolver;
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
                'slug' => $slug,
            ]);

            // Add colors
            $colors = ['color.btn.primary.bg', 'color.btn.primary.text'];

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
