<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SiteFaviconQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteImageRepository $repository
    ) {
    }

    public function __invoke(): ?SiteImage
    {
        return $this->repository->getSiteFavicon();
    }
}
