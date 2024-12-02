<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ViewerFollowOpinionResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private UserRepository $userRepository)
    {
    }

    public function __invoke(Opinion $opinion, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->userRepository->isViewerFollowingOpinion($opinion, $viewer);
    }
}
