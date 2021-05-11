<?php

namespace Capco\AppBundle\GraphQL\Resolver\HomePageProjectsSectionConfiguration;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class HomePageProjectsSectionConfigurationProjectsResolver implements ResolverInterface
{
    private $logger;
    private $projectRepository;

    public function __construct(ProjectRepository $projectRepository, LoggerInterface $logger)
    {
        $this->projectRepository = $projectRepository;
        $this->logger = $logger;
    }

    public function __invoke(Section $section): ConnectionInterface
    {
        $totalCount = $section->getSectionProjects()->count();

        $args = new Argument([
            'first' => $totalCount,
        ]);

        $paginator = new Paginator(function () use ($section) {
            try {
                $arguments = $section
                    ->getSectionProjects()
                    ->map(function ($sectionProject) {
                        return $sectionProject->getProject();
                    })
                    ->toArray();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \Error('Error during fetching projects of ' . $section->getTitle());
            }

            return $arguments;
        });

        return $paginator->auto($args, $totalCount);
    }
}
