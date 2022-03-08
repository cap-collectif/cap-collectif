<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupIsUsedInEmailingCampaignResolver implements ResolverInterface
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
