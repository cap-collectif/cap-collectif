<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerFollowOpinionVersionResolver implements ResolverInterface
{
    use ResolverTrait;

    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function __invoke(OpinionVersion $version, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->userRepository->isViewerFollowingOpinionVersion($version, $viewer);
    }
}
