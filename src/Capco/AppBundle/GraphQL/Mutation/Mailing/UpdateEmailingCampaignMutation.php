<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\UpdateEmailingCampaignErrorCode;
use Capco\AppBundle\Form\EmailingCampaignType;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateEmailingCampaignMutation implements MutationInterface
{
    //when we set the sendAt date, it must be in more than 5mn to be sure the cron can pass.
    public const SEND_AT_SECURITY = 5*60;

    private EmailingCampaignRepository $repository;
    private EntityManagerInterface $entityManager;
    private FormFactoryInterface $formFactory;
    private MailingListRepository $mailingListRepository;

    public function __construct(
        EmailingCampaignRepository $repository,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        MailingListRepository $mailingListRepository
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
        $this->mailingListRepository = $mailingListRepository;
    }

    public function __invoke(Argument $input): array
    {
        $error = null;
        $emailingCampaign = null;

        try {
            $this->preventListError($input);
            $emailingCampaign = $this->getCampaign($input);
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

    private function getCampaign(Argument $input): EmailingCampaign
    {
        $id = GlobalId::fromGlobalId($input->offsetGet('id'))['id'];
        if (null === $id) {
            throw new UserError(UpdateEmailingCampaignErrorCode::ID_NOT_FOUND);
        }

        $emailingCampaign = $this->repository->find($id);
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
            if (is_string($sendAt)) {
                $sendAt = new \DateTime($sendAt);
            }
            self::checkSendAt($sendAt);
        }

        $emailingCampaign->setSendAt($sendAt);
        $emailingCampaign->setStatus(
            $sendAt ? EmailingCampaignStatus::PLANNED : EmailingCampaignStatus::DRAFT
        );
    }

    private static function checkSendAt(\DateTime $sendAt): void
    {
        if ($sendAt->getTimestamp() < time() + self::SEND_AT_SECURITY) {
            throw new UserError(UpdateEmailingCampaignErrorCode::TOO_LATE);
        }
    }

    private function preventListError(Argument $input): void
    {
        $mailingListGlobalId = $input->offsetGet('mailingList');
        $mailingInternal = $input->offsetGet('mailingInternal');
        if ($mailingListGlobalId && $mailingInternal) {
            throw new UserError(UpdateEmailingCampaignErrorCode::DOUBLE_LIST);
        }
        if ($mailingListGlobalId) {
            $mailingListId = GlobalId::fromGlobalId($mailingListGlobalId)['id'];
            if (
                null === $mailingListId
                || null === $this->mailingListRepository->find($mailingListId)) {
                throw new UserError(UpdateEmailingCampaignErrorCode::MAILING_LIST_NOT_FOUND);
            }
        }
        if ($mailingInternal && !EmailingCampaignInternalList::isValid($mailingInternal)) {
            throw new UserError(UpdateEmailingCampaignErrorCode::MAILING_LIST_NOT_FOUND);
        }
    }
}
