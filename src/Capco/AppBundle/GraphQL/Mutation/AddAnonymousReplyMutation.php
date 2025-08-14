<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class AddAnonymousReplyMutation extends ReplyMutation implements MutationInterface
{
    use MutationTrait;

    final public const INVALID_FORM = 'INVALID_FORM';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
        private readonly ResponsesFormatter $responsesFormatter,
        private readonly LoggerInterface $logger,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly Publisher $publisher,
        private readonly Indexer $indexer,
        private readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        private readonly ParticipantHelper $participantHelper,
        private readonly ReplyRepository $replyRepository,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        parent::__construct($validatePhoneReusabilityMutation);
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->globalIdResolver->resolve($values['questionnaireId'], null);
        unset($values['questionnaireId'], $values['participantToken']);

        $step = $questionnaire->getStep();

        $replyAnonymous = (new Reply())
            ->setQuestionnaire($questionnaire)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setPublishedAt(new \DateTime('now'))
        ;

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyAnonymousType::class, $replyAnonymous);
        $form->submit($values, false);

        $participant = $this->participantHelper->getOrCreateParticipant($input->offsetGet('participantToken'));
        $participantToken = $participant->getToken();

        $isParticipantMeetingRequirements = $this->participantIsMeetingRequirementsResolver->__invoke($participant, new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId()),
        ]));
        if (!$isParticipantMeetingRequirements) {
            $replyAnonymous->setMissingRequirementsStatus();
        } else {
            $replyAnonymous->setCompletedStatus();
        }

        $replyAnonymous->setParticipant($participant);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . $form->getErrors(true, false));

            return [
                'questionnaire' => $questionnaire,
                'reply' => null,
                'token' => null,
                'errorCode' => self::INVALID_FORM,
                'shouldTriggerConsentInternalCommunication' => false,
            ];
        }

        $participant->setLastContributedAt(new \DateTime());
        $this->em->persist($replyAnonymous);
        $this->em->flush();

        if (!$this->canReusePhone($replyAnonymous, $participantToken)) {
            return [
                'errorCode' => ValidatePhoneReusabilityMutation::PHONE_ALREADY_USED,
                'shouldTriggerConsentInternalCommunication' => false,
            ];
        }

        $this->indexer->index(Reply::class, $replyAnonymous->getId());
        $this->indexer->finishBulk();

        if ($questionnaire->isNotifyResponseCreate() || $replyAnonymous->getParticipantEmail()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'replyId' => $replyAnonymous->getId(),
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    ])
                )
            );
        }

        $shouldTriggerConsentInternalCommunication = $this->getShouldTriggerConsentInternalCommunication($questionnaire, $participant);

        return [
            'questionnaire' => $questionnaire,
            'reply' => $replyAnonymous,
            'participantToken' => $participantToken,
            'errorCode' => null,
            'shouldTriggerConsentInternalCommunication' => $shouldTriggerConsentInternalCommunication,
        ];
    }

    private function getShouldTriggerConsentInternalCommunication(Questionnaire $questionnaire, Participant $participant): bool
    {
        $repliesCount = $this->replyRepository->count(['questionnaire' => $questionnaire, 'participant' => $participant]);
        $consentInternalCommunication = $participant->isConsentInternalCommunication();

        return !$consentInternalCommunication && 1 === $repliesCount;
    }
}
