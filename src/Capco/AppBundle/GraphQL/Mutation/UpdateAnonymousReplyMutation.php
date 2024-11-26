<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateAnonymousReplyMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly FormFactoryInterface $formFactory;
    private readonly ResponsesFormatter $responsesFormatter;
    private readonly ReplyAnonymousRepository $replyAnonymousRepository;
    private readonly Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->responsesFormatter = $responsesFormatter;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $reply = $this->getReply($input);
        $reply = $this->updateReply($reply, $input);
        $this->em->flush();

        if (self::shouldNotify($reply)) {
            $this->notify($reply);
        }

        return ['reply' => $reply];
    }

    private function notify(ReplyAnonymous $reply): void
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

    private function getReply(Argument $argument): ReplyAnonymous
    {
        $hashedToken = $argument->offsetGet('hashedToken');
        $decodedToken = base64_decode((string) $hashedToken);
        $reply = $this->replyAnonymousRepository->findOneBy(['token' => $decodedToken]);

        if (!$reply) {
            throw new UserError('Reply not found.');
        }

        return $reply;
    }

    private function updateReply(ReplyAnonymous $reply, Argument $input): ReplyAnonymous
    {
        $form = $this->formFactory->create(ReplyAnonymousType::class, $reply);
        $form->submit($this->formatValuesForForm($input), false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        return $reply;
    }

    private function formatValuesForForm(Argument $argument): array
    {
        $values = $argument->getArrayCopy();
        unset($values['hashedToken']);
        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        return $values;
    }

    private static function shouldNotify(ReplyAnonymous $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();

        return $questionnaire && $questionnaire->isNotifyResponseUpdate();
    }
}
