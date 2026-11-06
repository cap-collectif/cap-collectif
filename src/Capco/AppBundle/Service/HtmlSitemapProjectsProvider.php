<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Enum\ProjectStatus;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class HtmlSitemapProjectsProvider
{
    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly StepUrlResolver $stepUrlResolver,
        private readonly RouterInterface $router,
    ) {}

    /** @return array<int, array{title: string, url: string, steps: array<int, array{title: string, url: string}>}> */
    public function getProjects(?string $locale): array
    {
        $projects = [];
        $statusesWithSteps = [
            ProjectStatus::FUTURE_WITHOUT_FINISHED_STEPS,
            ProjectStatus::FUTURE_WITH_FINISHED_STEPS,
            ProjectStatus::OPENED_PARTICIPATION,
            ProjectStatus::OPENED,
        ];

        /** @var Project $project */
        foreach ($this->projectRepository->findPublicNonArchivedWithSteps($locale) as $project) {
            $firstStep = $project->getFirstStep();
            if (!$firstStep || !$firstStep->getEnabled()) {
                continue;
            }

            $steps = [];
            if (\in_array($project->getCurrentStepState(), $statusesWithSteps, true)) {
                /** @var ProjectAbstractStep $projectStep */
                foreach ($project->getSteps() as $projectStep) {
                    $step = $projectStep->getStep();
                    if (!$step || !$step->getEnabled() || !$step->getTitle() || !$step->getSlug()) {
                        continue;
                    }

                    $steps[] = [
                        'title' => $step->getTitle(),
                        'url' => $this->stepUrlResolver->__invoke($step),
                    ];
                }
            }

            $projects[] = [
                'title' => $project->getTitle(),
                'url' => $this->router->generate(
                    'app_project_show_project',
                    ['projectSlug' => $project->getSlug(), '_locale' => $locale],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
                'steps' => $steps,
            ];
        }

        return $projects;
    }
}
