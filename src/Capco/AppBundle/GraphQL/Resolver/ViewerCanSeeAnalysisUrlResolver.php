<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerCanSeeAnalysisUrlResolver implements ResolverInterface
{
    use ResolverTrait;

    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function __invoke($viewer, ?\ArrayObject $context = null): bool
    {
        return $this->isGranted($viewer, $context);
    }

    public function isGranted($viewer, ?\ArrayObject $context = null): bool
    {
        if ($this->isACLDisabled($context)) {
            return true;
        }
        $this->preventNullableViewer($viewer);

        return \count($this->userRepository->isAssignedUsersOnProposal($viewer)) ||
            $viewer->isProjectAdmin();
    }
}
