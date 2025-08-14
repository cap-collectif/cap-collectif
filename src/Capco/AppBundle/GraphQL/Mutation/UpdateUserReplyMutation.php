<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateUserReplyMutation extends ReplyMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $em,
        private FormFactoryInterface $formFactory,
        private ResponsesFormatter $responsesFormatter,
        private Publisher $publisher,
        private GlobalIdResolver $globalIdResolver,
        ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation
    ) {
        parent::__construct($validatePhoneReusabilityMutation);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $reply = $this->getReply($input->offsetGet('replyId'), $viewer);
        $wasDraft = $reply->isDraft();

//        if (!$this->canReusePhone($reply, null, $viewer)) {
//            return ['errorCode' => ValidatePhoneReusabilityMutation::PHONE_ALREADY_USED];
//        }

        $reply = $this->updateReply($reply, $input, $wasDraft);
        $this->em->flush();

        if (self::shouldNotify($reply)) {
            $this->notify($reply, $wasDraft);
        }

        return ['reply' => $reply];
    }

    private function notify(Reply $reply, bool $wasDraft): void
    {
        $this->publisher->publish(
            'questionnaire.reply',
            new Message(
                json_encode([
                    'replyId' => $reply->getId(),
                    'state' => $wasDraft
                        ? QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE
                        : QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                ])
            )
        );
    }

    private function getReply(string $id, User $viewer): Reply
    {
        $reply = $this->globalIdResolver->resolve($id);

        if (!$reply instanceof Reply) {
            throw new UserError('Reply not found.');
        }
        if ($reply->getAuthor() !== $viewer) {
            throw new UserError('You are not allowed to update this reply.');
        }

        return $reply;
    }

    private function updateReply(Reply $reply, Argument $input, bool $wasDraft): Reply
    {
        $form = $this->formFactory->create(ReplyType::class, $reply, [
            'anonymousAllowed' => $reply->getQuestionnaire()->isAnonymousAllowed(),
        ]);
        $form->submit($this->formatValuesForForm($input), false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }
        if (
            $wasDraft
            && $reply
                ->getQuestionnaire()
                ->getStep()
                ->isOpen()
        ) {
            DoctrineListener::setPublishedStatus($reply);
        }

        return $reply;
    }

    private function formatValuesForForm(Argument $argument): array
    {
        $values = $argument->getArrayCopy();
        unset($values['replyId']);
        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        return $values;
    }

    private static function shouldNotify(Reply $reply): bool
    {
        return !$reply->isDraft()
            && $reply->getQuestionnaire()
            && $reply->getQuestionnaire()->isNotifyResponseUpdate();
    }
}
