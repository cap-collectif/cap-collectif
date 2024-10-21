<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SectionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CarrouselConfigurationResolver implements QueryInterface
{
    private SectionRepository $sectionRepository;

    public function __construct(SectionRepository $sectionRepository)
    {
        $this->sectionRepository = $sectionRepository;
    }

    public function __invoke(): ?object
    {
        return $this->sectionRepository->findOneBy(['type' => 'carrousel']);
    }
}
