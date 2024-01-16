<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateUserReplyMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private ResponsesFormatter $responsesFormatter;
    private ReplyRepository $replyRepo;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        ResponsesFormatter $responsesFormatter,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->responsesFormatter = $responsesFormatter;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $reply = $this->getReply($input, $viewer);
        $wasDraft = $reply->isDraft();
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

    private function getReply(Argument $argument, User $viewer): Reply
    {
        $reply = $this->replyRepo->find(
            GlobalId::fromGlobalId($argument->offsetGet('replyId'))['id']
        );

        if (!$reply) {
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
