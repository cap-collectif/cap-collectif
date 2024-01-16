<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Repository\SectionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class HomePageProjectsSectionConfigurationResolver implements QueryInterface
{
    private SectionRepository $sectionRepository;

    public function __construct(SectionRepository $sectionRepository)
    {
        $this->sectionRepository = $sectionRepository;
    }

    public function __invoke(Argument $args): ?Section
    {
        return $this->sectionRepository->findOneBy(['type' => 'projects']);
    }
}
