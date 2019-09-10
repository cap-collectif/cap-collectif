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
    public const LIST_PROJECTS_CACHE_KEY = 'listProjects';
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
        return [
            new TwigFunction('list_projectsById', [$this, 'listProjects']),
            new TwigFunction('themes_list', [$this, 'listThemes'])
        ];
    }

    /*
     * This inject lot of projects data in redux-store
     * Should be refactored when we can use APIs everywhere
     */
    public function listProjects(): array
    {
        $cachedItem = $this->cache->getItem(self::LIST_PROJECTS_CACHE_KEY);

        if (!$cachedItem->isHit()) {
            $projects = $this->projectRepo->findAllWithSteps();
            $data = [];

            foreach ($projects as $project) {
                $projectStepsData = [];
                $projectStepsByIdData = [];
                foreach ($project->getSteps() as $step) {
                    $realStep = $step->getStep();
                    $projectStepsStatus = [];
                    foreach ($realStep->getStatuses() as $status) {
                        $projectStepsStatus[] = [
                            'id' => $status->getId(),
                            'name' => $status->getName()
                        ];
                    }

                    $stepData = [
                        'id' => $this->getStepId($realStep),
                        'title' => $realStep->getTitle(),
                        'label' => $realStep->getLabel(),
                        'slug' => $realStep->getSlug(),
                        'startAt' => $realStep->getStartAt()
                            ? $realStep->getStartAt()->format(\DateTime::ATOM)
                            : null,
                        'endAt' => $realStep->getEndAt()
                            ? $realStep->getEndAt()->format(\DateTime::ATOM)
                            : null,
                        'position' => $realStep->getPosition(),
                        'type' => $realStep->getType(),
                        'enabled' => $realStep->getIsEnabled(),
                        'showProgressSteps' => method_exists($realStep, 'isAllowingProgressSteps')
                            ? $realStep->isAllowingProgressSteps()
                            : false,
                        'statuses' => $projectStepsStatus,
                        'status' => $this->stepHelper->getStatus($realStep),
                        'open' => $realStep->isOpen(),
                        'timeless' => $realStep->isTimeless(),
                        'titleHelpText' => method_exists($realStep, 'getTitleHelpText')
                            ? $realStep->getTitleHelpText()
                            : null,
                        'descriptionHelpText' => method_exists($realStep, 'getDescriptionHelpText')
                            ? $realStep->getDescriptionHelpText()
                            : null,
                        '_links' => [
                            'show' => $this->urlResolver->getStepUrl($realStep, true),
                            'stats' => $this->router->generate(
                                'app_project_show_stats',
                                ['projectSlug' => $project->getSlug()],
                                true
                            ),
                            'editSynthesis' => $this->router->generate(
                                'app_project_edit_synthesis',
                                [
                                    'projectSlug' => $project->getSlug(),
                                    'stepSlug' => $realStep->getSlug()
                                ],
                                true
                            )
                        ]
                    ];
                    $projectStepsData[] = $stepData;
                    $projectStepsByIdData[$stepData['id']] = $stepData;
                }
                $projectSerialized = $this->serializer->serialize($project, 'json', [
                    'groups' => [
                        'Projects',
                        'UserDetails',
                        'UserVotes',
                        'ThemeDetails',
                        'ProjectType'
                    ]
                ]);

                $projectId = GlobalId::toGlobalId('Project', $project->getId());
                $projectData = json_decode($projectSerialized, true);
                $projectData['id'] = $projectId;
                $projectData['steps'] = $projectStepsData;
                $projectData['stepsById'] = $projectStepsByIdData;
                $data[$projectId] = $projectData;
            }

            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
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
                    'title' => $theme->getTitle(),
                    'slug' => $theme->getSlug()
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
