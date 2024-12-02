<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class ThemeRuntime implements RuntimeExtensionInterface
{
    final public const LIST_THEMES_CACHE_KEY = 'listThemes';

    protected $themeRepo;
    protected $projectRepo;
    protected $twig;
    protected $stepHelper;

    public function __construct(
        ThemeRepository $themeRepo,
        ProjectRepository $projectRepo,
        \Twig_Extensions_Extension_Intl $twig,
        private readonly SerializerInterface $serializer,
        private readonly RouterInterface $router,
        StepHelper $stepHelper,
        private readonly UrlResolver $urlResolver,
        private readonly RedisCache $cache
    ) {
        $this->themeRepo = $themeRepo;
        $this->projectRepo = $projectRepo;
        $this->twig = $twig;
        $this->stepHelper = $stepHelper;
    }

    public function listThemes(): array
    {
        $cachedItem = $this->cache->getItem(self::LIST_THEMES_CACHE_KEY);

        if (!$cachedItem->isHit()) {
            $themes = $this->themeRepo->findBy(['isEnabled' => true]);
            $data = [];
            foreach ($themes as $theme) {
                $data[] = [
                    'id' => $theme->getId(),
                    'title' => $theme->translate()->getTitle(),
                    'slug' => $theme->translate()->getSlug(),
                ];
            }

            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    private function getStepId($step): string
    {
        return \in_array($step->getType(), ['collect', 'selection'])
            ? GlobalId::toGlobalId(ucfirst((string) $step->getType()) . 'Step', $step->getId())
            : $step->getId();
    }
}
