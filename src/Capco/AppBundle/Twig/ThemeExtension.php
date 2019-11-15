<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Capco\AppBundle\Cache\RedisCache;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ThemeExtension extends AbstractExtension
{
    public const LIST_THEMES_CACHE_KEY = 'listThemes';

    protected $themeRepo;
    protected $projectRepo;
    protected $twig;
    protected $stepHelper;
    private $serializer;
    private $router;
    private $urlResolver;
    private $cache;

    public function __construct(
        ThemeRepository $themeRepo,
        ProjectRepository $projectRepo,
        \Twig_Extensions_Extension_Intl $twig,
        SerializerInterface $serializer,
        RouterInterface $router,
        StepHelper $stepHelper,
        UrlResolver $urlResolver,
        RedisCache $cache
    ) {
        $this->themeRepo = $themeRepo;
        $this->projectRepo = $projectRepo;
        $this->twig = $twig;
        $this->serializer = $serializer;
        $this->router = $router;
        $this->stepHelper = $stepHelper;
        $this->urlResolver = $urlResolver;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('themes_list', [$this, 'listThemes'])];
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
                    'slug' => $theme->translate()->getSlug()
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
            ? GlobalId::toGlobalId(ucfirst($step->getType()) . 'Step', $step->getId())
            : $step->getId();
    }
}
