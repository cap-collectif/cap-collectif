<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SiteImageQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteImageRepository $repository
    ) {
    }

    public function __invoke(Argument $args): ?SiteImage
    {
        $keyname = $args->offsetGet('keyname');
        if ($keyname) {
            return $this->repository->findOneByKeyname($keyname);
        }

        return null;
    }
}
