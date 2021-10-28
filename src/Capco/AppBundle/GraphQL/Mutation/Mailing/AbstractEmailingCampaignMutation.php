<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

abstract class AbstractEmailingCampaignMutation implements MutationInterface
{
    protected GlobalIdResolver $resolver;

    public function __construct(GlobalIdResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    protected function findCampaignFromGlobalId(string $globalId, User $viewer): ?EmailingCampaign
    {
        $campaign = $this->resolver->resolve($globalId, $viewer);

        return $viewer->isAdmin() || $campaign->getOwner() === $viewer ? $campaign : null;
    }

    protected function getPlannedCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (null === $emailingCampaign) {
            throw new UserError(SendEmailingCampaignErrorCode::ID_NOT_FOUND);
        }

        if (EmailingCampaignStatus::PLANNED !== $emailingCampaign->getStatus()) {
            throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_CANCELED);
        }

        return $emailingCampaign;
    }

    protected function getSendableCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (null === $emailingCampaign) {
            throw new UserError(SendEmailingCampaignErrorCode::ID_NOT_FOUND);
        }

        if (!$emailingCampaign->canBeSent()) {
            throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_SENT);
        }

        return $emailingCampaign;
    }
}
