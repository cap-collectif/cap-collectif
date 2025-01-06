<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Enum\UpdateEmailingCampaignErrorCode;
use Capco\AppBundle\Form\EmailingCampaignType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    use MutationTrait;

    //when we set the sendAt date, it must be in more than 5mn to be sure the cron can pass.
    final public const SEND_AT_SECURITY = 5 * 60;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly GlobalIdResolver $globalIdResolver
    ) {
        parent::__construct($resolver, $entityManager, $authorizationChecker);
        $this->entityManager = $entityManager;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $error = null;

        try {
            $emailingCampaign = $this->getCampaign($input, $viewer);
            $this->preventListError($input, $emailingCampaign, $viewer);
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

    public function isGranted(string $emailCampaignId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $emailCampaign = $this->globalIdResolver->resolve($emailCampaignId, $viewer);

        return $this->authorizationChecker->isGranted(EmailingCampaignVoter::EDIT, $emailCampaign);
    }

    private function getCampaign(Argument $input, User $viewer): EmailingCampaign
    {
        $emailingCampaign = $this->findCampaignFromGlobalId($input->offsetGet('id'), $viewer);
        if (
            null === $emailingCampaign
            || !$this->authorizationChecker->isGranted(
                EmailingCampaignVoter::EDIT,
                $emailingCampaign
            )
        ) {
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

    private function preventListError(
        Argument $input,
        EmailingCampaign $emailingCampaign,
        User $viewer
    ): void {
        $this->checkSingleInput($input);
        $mailingListGlobalId = $input->offsetGet('mailingList');
        $groupListGlobalId = $input->offsetGet('emailingGroup');
        $mailingInternal = $input->offsetGet('mailingInternal');
        $projectGlobalId = $input->offsetGet('project');

        if ($mailingListGlobalId) {
            $this->findMailingList($mailingListGlobalId, $viewer)->addEmailingCampaign(
                $emailingCampaign
            );
        }
        if ($groupListGlobalId) {
            $this->findGroup($groupListGlobalId, $viewer);
        }
        if (
            $mailingInternal
            && (!$viewer->isAdmin() || !EmailingCampaignInternalList::isValid($mailingInternal))
        ) {
            throw new UserError(UpdateEmailingCampaignErrorCode::ID_NOT_FOUND_MAILING_LIST);
        }
        if ($projectGlobalId) {
            $this->findProject($projectGlobalId, $viewer);
        }
    }
}
