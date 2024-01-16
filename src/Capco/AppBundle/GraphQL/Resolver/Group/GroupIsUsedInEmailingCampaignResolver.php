<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class GroupIsUsedInEmailingCampaignResolver implements QueryInterface
{
    private EmailingCampaignRepository $repository;

    public function __construct(EmailingCampaignRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Group $group, Argument $args): bool
    {
        return $this->repository->countEmailingCampaignUsingGroup($group) > 0;
    }
}
