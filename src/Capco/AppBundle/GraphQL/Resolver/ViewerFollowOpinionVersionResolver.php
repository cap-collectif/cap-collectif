<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ViewerFollowOpinionVersionResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private UserRepository $userRepository
    ) {
    }

    public function __invoke(OpinionVersion $version, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->userRepository->isViewerFollowingOpinionVersion($version, $viewer);
    }
}
