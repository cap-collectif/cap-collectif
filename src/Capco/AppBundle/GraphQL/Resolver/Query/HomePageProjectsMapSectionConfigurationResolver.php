<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Repository\SectionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class HomePageProjectsMapSectionConfigurationResolver implements QueryInterface
{
    private readonly SectionRepository $sectionRepository;

    public function __construct(SectionRepository $sectionRepository)
    {
        $this->sectionRepository = $sectionRepository;
    }

    public function __invoke(Argument $args): ?Section
    {
        return $this->sectionRepository->findOneBy(['type' => 'projectsMap']);
    }
}
