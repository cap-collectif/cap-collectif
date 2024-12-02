<?php

namespace Capco\AppBundle\GraphQL\Resolver\HomePageProjectsSectionConfiguration;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class HomePageProjectsSectionConfigurationProjectsResolver implements QueryInterface
{
    public function __construct(private readonly ProjectRepository $projectRepository, private readonly LoggerInterface $logger)
    {
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
                    ->toArray()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \Error('Error during fetching projects of ' . $section->getTitle());
            }

            return $arguments;
        });

        return $paginator->auto($args, $totalCount);
    }
}
