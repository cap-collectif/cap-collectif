<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ReplyType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ReplyRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateReplyMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $redisStorageHelper;
    private $responsesFormatter;
    private $replyRepo;
    private $stepUrlResolver;
    private $publisher;
    private $questionnaireReplyNotifier;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        StepUrlResolver $stepUrlResolver,
        Publisher $publisher,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->responsesFormatter = $responsesFormatter;
        $this->stepUrlResolver = $stepUrlResolver;
        $this->publisher = $publisher;
        $this->questionnaireReplyNotifier = $questionnaireReplyNotifier;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $values = $input->getArrayCopy();
        $replyId = GlobalId::fromGlobalId($values['replyId']);
        /** @var Reply $reply */
        $reply = $this->replyRepo->find($replyId['id']);
        unset($values['replyId']);

        if (!$reply) {
            throw new UserError('Reply not found.');
        }
        $wasDraft = $reply->isDraft();
        $draft = false;
        if (isset($values['draft']) && true === $values['draft']) {
            $draft = true;
        }
        $reply->setPublishedAt(new \DateTime('now'));
        $author = $reply->getAuthor();
        if ($author !== $viewer) {
            throw new UserError('You are not allowed to update this reply.');
        }

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyType::class, $reply, []);
        $form->submit($values, false);
        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $questionnaireReply = $reply->getQuestionnaire();
        $isUpdated = $wasDraft && !$draft ? false : true;

        $state = !$isUpdated
            ? QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE
            : QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE;

        // we use the same code which the e2e test used
        QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE === $state
            ? $this->questionnaireReplyNotifier->onCreate($reply)
            : $this->questionnaireReplyNotifier->onUpdate($reply);

        if (
            $questionnaireReply &&
            !$reply->isDraft() &&
            $questionnaireReply->isNotifyResponseUpdate()
        ) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'replyId' => $reply->getId(),
                        'state' => $wasDraft
                            ? QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE
                            : QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE
                    ])
                )
            );
        }
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return ['reply' => $reply];
    }
}
