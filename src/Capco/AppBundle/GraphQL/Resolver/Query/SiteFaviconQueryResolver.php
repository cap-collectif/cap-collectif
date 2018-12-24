<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SiteFaviconQueryResolver implements ResolverInterface
{
    private $repository;

    public function __construct(SiteImageRepository $repository)
    {
        $this->repository = $repository;
    }

     public function __invoke(): ?SiteImage
    {
        return $this->repository->getSiteFavicon();
    }
}
