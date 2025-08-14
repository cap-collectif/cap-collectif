<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateAnonymousReplyMutation extends ReplyMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
        private readonly ResponsesFormatter $responsesFormatter,
        private readonly Publisher $publisher,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ParticipantHelper $participantHelper,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        parent::__construct($validatePhoneReusabilityMutation);
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $reply = $this->getReply($input);

        $participantToken = $input->offsetGet('participantToken');

        if (!$this->canReusePhone($reply, $participantToken)) {
            return ['errorCode' => ValidatePhoneReusabilityMutation::PHONE_ALREADY_USED];
        }

        $participant = $this->participantHelper->getParticipantByToken($participantToken);

        $reply = $this->updateReply($reply, $input);

        $participant->setLastContributedAt(new \DateTime());
        $this->em->flush();

        if (self::shouldNotify($reply)) {
            $this->notify($reply);
        }

        return ['reply' => $reply];
    }

    private function notify(Reply $reply): void
    {
        $this->publisher->publish(
            'questionnaire.reply',
            new Message(
                json_encode([
                    'replyId' => $reply->getId(),
                    'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                ])
            )
        );
    }

    private function getReply(Argument $argument): Reply
    {
        $replyId = $argument->offsetGet('replyId');

        /** * @var Reply $reply  */
        $reply = $this->globalIdResolver->resolve($replyId);

        if (null === $reply) {
            throw new UserError('Reply not found');
        }

        $participant = $reply->getParticipant();
        if (null === $participant) {
            throw new UserError('Reply is not anonymous');
        }

        $participantToken = $argument->offsetGet('participantToken');
        $decodedToken = base64_decode((string) $participantToken);

        if ($participant->getToken() !== $decodedToken) {
            throw new UserError('Given token does not match corresponding Participant');
        }

        return $reply;
    }

    private function updateReply(Reply $reply, Argument $input): Reply
    {
        $form = $this->formFactory->create(ReplyType::class, $reply);
        $form->submit($this->formatValuesForForm($input), false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        return $reply;
    }

    private function formatValuesForForm(Argument $argument): array
    {
        $values = $argument->getArrayCopy();
        unset($values['participantToken'], $values['replyId']);

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        return $values;
    }

    private static function shouldNotify(Reply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();

        return $questionnaire && $questionnaire->isNotifyResponseUpdate();
    }
}
