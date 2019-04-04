<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Repository\GroupRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class GroupListResolver implements ResolverInterface
{
    private $groupRepository;

    public function __construct(GroupRepository $groupRepository)
    {
        $this->groupRepository = $groupRepository;
    }

    public function __invoke(): array
    {
        return $this->groupRepository->findAll();
    }
}
