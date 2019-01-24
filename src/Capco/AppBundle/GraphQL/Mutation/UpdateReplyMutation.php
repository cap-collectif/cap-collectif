<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ReplyType;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Notifier\UserNotifier;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateReplyMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $redisStorageHelper;
    private $responsesFormatter;
    private $replyRepo;
    private $userNotifier;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        UserNotifier $userNotifier
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->responsesFormatter = $responsesFormatter;
        $this->userNotifier = $userNotifier;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $values = $input->getRawArguments();
        $reply = $this->replyRepo->find($values['replyId']);
        unset($values['replyId']);

        if (!$reply) {
            throw new UserError('Reply not found.');
        }

        if ($reply->getAuthor() == !$user) {
            throw new UserError('You are not allowed to update this reply.');
        }

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyType::class, $reply, []);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $questionnaire = $reply->getQuestionnaire();
        if ($questionnaire && $questionnaire->isAcknowledgeReplies() && !$reply->isDraft()) {
            $this->userNotifier->acknowledgeReply($questionnaire->getStep()->getProject(), $reply);
        }

        $this->em->flush();
        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['reply' => $reply];
    }
}
