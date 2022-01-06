<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\CreateEmailingCampaignErrorCode;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\UpdateEmailingCampaignErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CreateEmailingCampaignMutation implements MutationInterface
{
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $entityManager;
    private TranslatorInterface $translator;
    private SiteParameterResolver $siteParams;
    private SenderEmailResolver $senderEmailResolver;

    public function __construct(
        EntityManagerInterface $entityManager,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParams,
        SenderEmailResolver $senderEmailResolver,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->entityManager = $entityManager;
        $this->translator = $translator;
        $this->siteParams = $siteParams;
        $this->senderEmailResolver = $senderEmailResolver;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $emailingCampaign = $this->createDefaultCampaign($viewer);
        $mailingListId = $input->offsetGet('mailingList');
        $emailingGroupId = $input->offsetGet('emailingGroup');
        if ($emailingGroupId && $mailingListId) {
            return [
                'emailingCampaign' => null,
                'error' => UpdateEmailingCampaignErrorCode::DOUBLE_LIST,
            ];
        }
        if ($mailingListId) {
            if ($error = $this->setMailingListOrError($emailingCampaign, $mailingListId, $viewer)) {
                return compact('error');
            }
        }
        if ($emailingGroupId) {
            if (
                $error = $this->setMailingGroupOrError($emailingCampaign, $emailingGroupId, $viewer)
            ) {
                return compact('error');
            }
        }

        $this->entityManager->persist($emailingCampaign);
        $this->entityManager->flush();

        return compact('emailingCampaign');
    }

    private function createDefaultCampaign(User $viewer): EmailingCampaign
    {
        $emailingCampaign = new EmailingCampaign();
        $emailingCampaign->setName(
            $this->translator->trans('global.campaign.new', [], 'CapcoAppBundle')
        );
        $emailingCampaign->setOwner($viewer);
        $emailingCampaign->setSenderEmail($this->senderEmailResolver->__invoke());
        $emailingCampaign->setSenderName(
            $this->siteParams->getValue('admin.mail.notifications.send_name') ??
                $emailingCampaign->getSenderEmail()
        );
        $emailingCampaign->setOwner($viewer);

        return $emailingCampaign;
    }

    private function setMailingListOrError(
        EmailingCampaign $emailingCampaign,
        string $mailingListId,
        User $viewer
    ): ?string {
        if ($viewer->isAdmin() && \in_array($mailingListId, EmailingCampaignInternalList::ALL)) {
            $emailingCampaign->setMailingInternal($mailingListId);
        } elseif ($mailingList = $this->findMailingList($mailingListId, $viewer)) {
            $emailingCampaign->setMailingList($mailingList);
            $mailingList->setIsDeletable(false);
        } else {
            return CreateEmailingCampaignErrorCode::ID_NOT_FOUND_MAILING_LIST;
        }

        return null;
    }

    private function setMailingGroupOrError(
        EmailingCampaign $emailingCampaign,
        string $groupId,
        User $viewer
    ): ?string {
        if ($group = $this->findGroup($groupId, $viewer)) {
            $emailingCampaign->setEmailingGroup($group);
        } else {
            return CreateEmailingCampaignErrorCode::ID_NOT_FOUND_GROUP;
        }

        return null;
    }

    private function findMailingList(string $globalId, User $viewer): ?MailingList
    {
        $mailingList = $this->globalIdResolver->resolve($globalId, $viewer);
        if ($mailingList && ($viewer->isAdmin() || $mailingList->getOwner() === $viewer)) {
            return $mailingList;
        }

        return null;
    }

    private function findGroup(string $globalId, User $viewer): ?Group
    {
        $group = $this->globalIdResolver->resolve($globalId, $viewer);
        if ($group && $viewer->isAdmin()) {
            return $group;
        }

        return null;
    }
}
