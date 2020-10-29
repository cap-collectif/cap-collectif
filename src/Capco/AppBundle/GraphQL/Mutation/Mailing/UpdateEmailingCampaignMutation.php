<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\UpdateEmailingCampaignErrorCode;
use Capco\AppBundle\Form\EmailingCampaignType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    //when we set the sendAt date, it must be in more than 5mn to be sure the cron can pass.
    public const SEND_AT_SECURITY = 5 * 60;

    private EntityManagerInterface $entityManager;
    private FormFactoryInterface $formFactory;
    private MailingListRepository $mailingListRepository;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        MailingListRepository $mailingListRepository
    ) {
        parent::__construct($resolver);
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
        $this->mailingListRepository = $mailingListRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;
        $emailingCampaign = null;

        try {
            $emailingCampaign = $this->getCampaign($input, $viewer);
            $this->preventListError($input, $emailingCampaign);
            self::handleSendAt($input, $emailingCampaign);

            $form = $this->formFactory->create(EmailingCampaignType::class, $emailingCampaign);
            $form->submit($input->getArrayCopy());

            $this->entityManager->flush();
        } catch (UserError $exception) {
            $error = $exception->getMessage();
            $emailingCampaign = null;
        }

        return compact('error', 'emailingCampaign');
    }

    private function getCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (null === $emailingCampaign) {
            throw new UserError(UpdateEmailingCampaignErrorCode::ID_NOT_FOUND);
        }

        if (!$emailingCampaign->isEditable()) {
            throw new UserError(UpdateEmailingCampaignErrorCode::NOT_EDITABLE);
        }

        return $emailingCampaign;
    }

    private static function handleSendAt(Argument $input, EmailingCampaign $emailingCampaign): void
    {
        $sendAt = $input->offsetGet('sendAt');
        if ($sendAt) {
            if (\is_string($sendAt)) {
                $sendAt = new \DateTime($sendAt);
            }
            self::checkSendAt($sendAt);
        }

        $emailingCampaign->setSendAt($sendAt);
    }

    private static function checkSendAt(\DateTime $sendAt): void
    {
        if ($sendAt->getTimestamp() < time() + self::SEND_AT_SECURITY) {
            throw new UserError(UpdateEmailingCampaignErrorCode::TOO_LATE);
        }
    }

    private function preventListError(Argument $input, EmailingCampaign $emailingCampaign): void
    {
        $mailingListGlobalId = $input->offsetGet('mailingList');
        $mailingInternal = $input->offsetGet('mailingInternal');
        if ($mailingListGlobalId && $mailingInternal) {
            throw new UserError(UpdateEmailingCampaignErrorCode::DOUBLE_LIST);
        }
        if ($mailingListGlobalId) {
            $mailingList = $this->getMailingList($mailingListGlobalId);
            $mailingList->addEmailingCampaign($emailingCampaign);
        }
        if ($mailingInternal && !EmailingCampaignInternalList::isValid($mailingInternal)) {
            throw new UserError(UpdateEmailingCampaignErrorCode::MAILING_LIST_NOT_FOUND);
        }
    }

    private function getMailingList(string $globalId): MailingList
    {
        $mailingListId = GlobalId::fromGlobalId($globalId)['id'];
        if (null === $mailingListId) {
            throw new UserError(UpdateEmailingCampaignErrorCode::MAILING_LIST_NOT_FOUND);
        }
        $mailingList = $this->mailingListRepository->find($mailingListId);
        if (null === $mailingList) {
            throw new UserError(UpdateEmailingCampaignErrorCode::MAILING_LIST_NOT_FOUND);
        }

        return $mailingList;
    }
}
