<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ReplyType;
use Symfony\Component\Form\FormFactoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Notifier\UserNotifier;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;

class UpdateReplyMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $redisStorageHelper;
    private $responsesFormatter;
    private $replyRepo;
    private $userNotifier;
    private $stepUrlResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        UserNotifier $userNotifier,
        StepUrlResolver $stepUrlResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->responsesFormatter = $responsesFormatter;
        $this->userNotifier = $userNotifier;
        $this->stepUrlResolver = $stepUrlResolver;
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
            $step = $questionnaire->getStep();
            $project = $step->getProject();
            if ($step) {
                $endAt = $step->getEndAt();
                $stepUrl = $this->stepUrlResolver->__invoke($step);
            } else {
                $endAt = null;
                $stepUrl = '';
            }
            $this->userNotifier->acknowledgeReply($project, $reply, $endAt, $stepUrl, $step, true);
        }

        $this->em->flush();
        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['reply' => $reply];
    }
}
