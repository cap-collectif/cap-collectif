<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\CreateEmailingCampaignErrorCode;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Contracts\Translation\TranslatorInterface;

class CreateEmailingCampaignMutation implements MutationInterface
{
    private MailingListRepository $mailingListRepository;
    private EntityManagerInterface $entityManager;
    private TranslatorInterface $translator;
    private SiteParameterResolver $siteParams;
    private SenderEmailResolver $senderEmailResolver;

    public function __construct(
        MailingListRepository $mailingListRepository,
        EntityManagerInterface $entityManager,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParams,
        SenderEmailResolver $senderEmailResolver
    ) {
        $this->mailingListRepository = $mailingListRepository;
        $this->entityManager = $entityManager;
        $this->translator = $translator;
        $this->siteParams = $siteParams;
        $this->senderEmailResolver = $senderEmailResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $emailingCampaign = $this->createDefaultCampaign($viewer);
        if ($mailingListId = $input->offsetGet('mailingList')) {
            if ($error = $this->setMailingListOrError($emailingCampaign, $mailingListId, $viewer)) {
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

    private function findMailingList(string $globalId, User $viewer): ?MailingList
    {
        $id = GlobalId::fromGlobalId($globalId)['id'];
        if ($id) {
            $mailingList = $this->mailingListRepository->find($id);
            if ($mailingList && ($viewer->isAdmin() || $mailingList->getOwner() === $viewer)) {
                return $mailingList;
            }
        }

        return null;
    }
}
