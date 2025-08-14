<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Service\ReplyCounterIndexer;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddUserReplyMutation extends ReplyMutation implements MutationInterface
{
    use MutationTrait;

    public const REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET';
    public const CONTRIBUTION_NOT_ALLOWED = 'CONTRIBUTION_NOT_ALLOWED';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
        private readonly ReplyRepository $replyRepo,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ResponsesFormatter $responsesFormatter,
        private readonly LoggerInterface $logger,
        private readonly Publisher $publisher,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly StepRequirementsResolver $stepRequirementsResolver,
        private readonly ReplyCounterIndexer $replyCounterIndexer,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        parent::__construct($validatePhoneReusabilityMutation);
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->globalIdResolver->resolve($values['questionnaireId'], $user);
        unset($values['questionnaireId']);

        if (!$this->canContributeAgain($questionnaire, $user)) {
            return ['errorCode' => self::CONTRIBUTION_NOT_ALLOWED, 'shouldTriggerConsentInternalCommunication' => false];
        }

        if (!$questionnaire->isMultipleRepliesAllowed()) {
            $previousReply = $this->replyRepo->getOneForUserAndQuestionnaire($questionnaire, $user);
            if ((bool) $previousReply) {
                throw new UserError('Only one reply by user is allowed for this questionnaire.');
            }
        }

        $step = $questionnaire->getStep();

        $reply = (new Reply())
            ->setAuthor($user)
            ->setQuestionnaire($questionnaire)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
        ;

        $isMeetingRequirements = $this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($user, $step);
        if (!$isMeetingRequirements) {
            $reply->setMissingRequirementsStatus();
        } else {
            $reply->setCompletedStatus();
        }

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyType::class, $reply, [
            'anonymousAllowed' => $questionnaire->isAnonymousAllowed(),
        ]);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }

        $this->em->persist($reply);
        $this->em->flush();

        if (!$this->canReusePhone($reply, null, $user)) {
            return ['errorCode' => ValidatePhoneReusabilityMutation::PHONE_ALREADY_USED, 'shouldTriggerConsentInternalCommunication' => false];
        }

        $this->replyCounterIndexer->syncIndex($reply);

        if (!$reply->isDraft()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'replyId' => $reply->getId(),
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    ])
                )
            );
        }

        $shouldTriggerConsentInternalCommunication = $this->getShouldTriggerConsentInternalCommunication($reply, $questionnaire, $user);

        return ['questionnaire' => $questionnaire, 'reply' => $reply, 'errorCode' => null,
            'shouldTriggerConsentInternalCommunication' => $shouldTriggerConsentInternalCommunication,
        ];
    }

    private function getShouldTriggerConsentInternalCommunication(Reply $reply, Questionnaire $questionnaire, User $user): bool
    {
        if ($reply->isDraft()) {
            return false;
        }

        $repliesCount = $this->replyRepo->count(['questionnaire' => $questionnaire, 'author' => $user, 'draft' => false]);
        $consentInternalCommunication = $user->isConsentInternalCommunication();

        return !$consentInternalCommunication && 1 === $repliesCount;
    }

    private function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error(__METHOD__ . ' : ' . $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }

    private function canContributeAgain(Questionnaire $questionnaire, User $user): bool
    {
        $step = $questionnaire->getStep();
        $hasEmailVerifiedRequirement = $step->getRequirements()->filter(fn (Requirement $requirement) => Requirement::EMAIL_VERIFIED === $requirement->getType())->count() > 0;

        if (!$hasEmailVerifiedRequirement) {
            return $questionnaire->canContribute($user);
        }

        $existingParticipantAlreadyContributedWithSameEmail = \count($this->replyRepo->findByParticipantEmail($user->getEmail(), $questionnaire)) > 0;

        if ($existingParticipantAlreadyContributedWithSameEmail) {
            return false;
        }

        return true;
    }
}
