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
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\AppBundle\Security\MailingListVoter;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractEmailingCampaignMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        protected GlobalIdResolver $resolver,
        protected EntityManagerInterface $entityManager,
        protected AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    protected function findCampaignFromGlobalId(string $globalId, User $viewer): ?EmailingCampaign
    {
        $campaign = $this->resolver->resolve($globalId, $viewer);
        if ($this->authorizationChecker->isGranted(EmailingCampaignVoter::VIEW, $campaign)) {
            return $campaign;
        }

        return null;
    }

    protected function getPlannedCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $this->formatInput($input);
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (
            null === $emailingCampaign
            || !$this->authorizationChecker->isGranted(
                EmailingCampaignVoter::EDIT,
                $emailingCampaign
            )
        ) {
            throw new UserError(SendEmailingCampaignErrorCode::ID_NOT_FOUND);
        }

        if (EmailingCampaignStatus::PLANNED !== $emailingCampaign->getStatus()) {
            throw new UserError(SendEmailingCampaignErrorCode::CANNOT_BE_CANCELED);
        }

        return $emailingCampaign;
    }

    protected function getSendableCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $this->formatInput($input);
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (
            null === $emailingCampaign
            || !$this->authorizationChecker->isGranted(
                EmailingCampaignVoter::SEND,
                $emailingCampaign
            )
        ) {
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
        $canViewMailingList = $this->authorizationChecker->isGranted(
            MailingListVoter::VIEW,
            $mailingList
        );
        if (!$canViewMailingList) {
            throw new UserError(CreateEmailingCampaignErrorCode::ID_NOT_FOUND_MAILING_LIST);
        }

        return $mailingList;
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
        if ($project && $this->authorizationChecker->isGranted(ProjectVoter::VIEW, $project)) {
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
