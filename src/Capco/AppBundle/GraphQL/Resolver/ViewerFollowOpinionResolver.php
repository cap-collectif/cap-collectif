<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowOpinionResolver implements ResolverInterface
{
    use ResolverTrait;

    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Opinion $opinion, ?User $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->userRepository->isViewerFollowingOpinion($opinion, $viewer);
    }
}
