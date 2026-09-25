<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProjectSettings;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectSettingsImageQueryResolver implements QueryInterface
{
    public function __construct(private readonly SiteImageRepository $repository)
    {
    }

    /**
     * @return SiteImage[]
     */
    public function __invoke(): array
    {
        return array_values(array_filter(
            $this->repository->findBy(['category' => 'pages.projects'], ['position' => 'ASC']),
            static fn (object $image): bool => $image instanceof SiteImage
        ));
    }
}
