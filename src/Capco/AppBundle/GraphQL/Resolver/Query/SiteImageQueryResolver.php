<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\SiteImage;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SiteImageQueryResolver implements ResolverInterface
{
    private $repository;

    public function __construct(SiteImageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): ?SiteImage
    {
        $keyname = $args->offsetGet('keyname');
        if ($keyname) {
            return $this->repository->findOneByKeyname($keyname);
        }
    }
}
