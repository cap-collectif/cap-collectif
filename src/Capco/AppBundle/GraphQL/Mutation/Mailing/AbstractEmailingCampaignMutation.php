<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\CreateEmailingCampaignErrorCode;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

abstract class AbstractEmailingCampaignMutation implements MutationInterface
{
    protected GlobalIdResolver $resolver;
    protected EntityManagerInterface $entityManager;

    public function __construct(GlobalIdResolver $resolver, EntityManagerInterface $entityManager)
    {
        $this->resolver = $resolver;
        $this->entityManager = $entityManager;
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

    protected function findMailingList(string $globalId, User $viewer): MailingList
    {
        $mailingList = $this->resolver->resolve($globalId, $viewer);
        if ($mailingList && ($viewer->isAdmin() || $mailingList->getOwner() === $viewer)) {
            return $mailingList;
        }

        throw new UserError(CreateEmailingCampaignErrorCode::ID_NOT_FOUND_MAILING_LIST);
    }

    protected function findGroup(string $globalId, User $viewer): Group
    {
        $group = $this->resolver->resolve($globalId, $viewer);
        if ($group && $viewer->isAdmin()) {
            return $group;
        }

        throw new UserError(CreateEmailingCampaignErrorCode::ID_NOT_FOUND_GROUP);
    }

    protected function findProject(string $globalId, User $viewer): Project
    {
        $project = $this->resolver->resolve($globalId, $viewer);
        if ($project && ($viewer->isAdmin() || $project->getOwner() === $viewer)) {
            return $project;
        }

        throw new UserError(CreateEmailingCampaignErrorCode::ID_NOT_FOUND_PROJECT);
    }

    protected function checkSingleInput(Argument $input): void
    {
        $count = 0;
        if ($input->offsetGet('mailingList')) {
            ++$count;
        }
        if ($input->offsetGet('mailingInternal')) {
            ++$count;
        }
        if ($input->offsetGet('emailingGroup')) {
            ++$count;
        }
        if ($input->offsetGet('project')) {
            ++$count;
        }
        if ($count > 1) {
            throw new UserError(CreateEmailingCampaignErrorCode::DOUBLE_LIST);
        }
    }
}
