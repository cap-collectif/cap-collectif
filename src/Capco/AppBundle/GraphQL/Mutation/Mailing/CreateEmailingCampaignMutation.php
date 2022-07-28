<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use GraphQL\Error\UserError;
use Symfony\Contracts\Translation\TranslatorInterface;

class CreateEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
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
        parent::__construct($globalIdResolver, $entityManager);
        $this->translator = $translator;
        $this->siteParams = $siteParams;
        $this->senderEmailResolver = $senderEmailResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        try {
            $this->checkSingleInput($input);
            $emailingCampaign = $this->createDefaultCampaign($viewer);
            $this->setReceiptIfAny($emailingCampaign, $input, $viewer);

            $this->entityManager->persist($emailingCampaign);
            $this->entityManager->flush();
        } catch (UserError $error) {
            return [
                'emailingCampaign' => null,
                'error' => $error->getMessage(),
            ];
        }

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
        $emailingCampaign->setCreator($viewer);

        return $emailingCampaign;
    }

    private function setReceiptIfAny(
        EmailingCampaign $emailingCampaign,
        Argument $input,
        User $viewer
    ): EmailingCampaign {
        if ($mailingListId = $input->offsetGet('mailingList')) {
            $this->setMailingList($emailingCampaign, $mailingListId, $viewer);
        }
        if ($emailingGroupId = $input->offsetGet('emailingGroup')) {
            $emailingCampaign->setEmailingGroup($this->findGroup($emailingGroupId, $viewer));
        }
        if ($projectId = $input->offsetGet('project')) {
            $emailingCampaign->setProject($this->findProject($projectId, $viewer));
        }

        return $emailingCampaign;
    }

    private function setMailingList(
        EmailingCampaign $emailingCampaign,
        string $mailingListId,
        User $viewer
    ): void {
        if ($viewer->isAdmin() && \in_array($mailingListId, EmailingCampaignInternalList::ALL)) {
            $emailingCampaign->setMailingInternal($mailingListId);
        } else {
            $mailingList = $this->findMailingList($mailingListId, $viewer);
            $emailingCampaign->setMailingList($mailingList);
            $mailingList->setIsDeletable(false);
        }
    }
}
