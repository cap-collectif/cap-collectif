<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Symfony\Component\Routing\Router;
use Symfony\Component\Serializer\SerializerInterface;

class ThemeExtension extends \Twig_Extension
{
    protected $themeRepo;
    protected $projectRepo;
    protected $twig;
    protected $stepHelper;
    private $serializer;
    private $router;
    private $urlResolver;

    public function __construct(
        ThemeRepository $themeRepo,
        ProjectRepository $projectRepo,
        \Twig_Extensions_Extension_Intl $twig,
        SerializerInterface $serializer,
        Router $router,
        StepHelper $stepHelper,
        UrlResolver $urlResolver
    ) {
        $this->themeRepo = $themeRepo;
        $this->projectRepo = $projectRepo;
        $this->twig = $twig;
        $this->serializer = $serializer;
        $this->router = $router;
        $this->stepHelper = $stepHelper;
        $this->urlResolver = $urlResolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('list_projectsById', [$this, 'listProjects']),
            new \Twig_SimpleFunction('themes_list', [$this, 'listThemes']),
        ];
    }

    public function listProjects(): array
    {
        $projects = $this->projectRepo->findAll();
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
                        'name' => $status->getName(),
                    ];
                }

                $stepData = [
                    'id' => $realStep->getId(),
                    'title' => $realStep->getTitle(),
                    'label' => $realStep->getLabel(),
                    'body' => $realStep->getBody(),
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
                        : false, //|default(false),
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
                                'stepSlug' => $realStep->getSlug(),
                            ],
                            true
                        ),
                    ],
                ];
                $projectStepsData[] = $stepData;
                $projectStepsByIdData[$realStep->getId()] = $stepData;
            }

            $projectSerialized = $this->serializer->serialize($project, 'json', [
                'groups' => ['Projects', 'UserDetails', 'UserVotes', 'ThemeDetails', 'ProjectType'],
            ]);

            $projectData = json_decode($projectSerialized, true);
            $projectData['steps'] = $projectStepsData;
            $projectData['stepsById'] = $projectStepsByIdData;
            $data[$project->getId()] = $projectData;
        }

        return $data;
    }

    public function listThemes(): array
    {
        $themes = $this->themeRepo->findBy(['isEnabled' => true]);
        $list = [];
        foreach ($themes as $theme) {
            $list[] = [
                'id' => $theme->getId(),
                'title' => $theme->getTitle(),
                'slug' => $theme->getSlug(),
            ];
        }

        return $list;
    }
}
