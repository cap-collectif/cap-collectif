<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddReplyMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $questionnaireRepo;
    private $redisStorageHelper;
    private $responsesFormatter;
    private $logger;
    private $replyRepo;
    private $userNotifier;
    private $stepUrlResolver;
    private $questionnaireReplyNotifier;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        QuestionnaireRepository $questionnaireRepo,
        RedisStorageHelper $redisStorageHelper,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        UserNotifier $userNotifier,
        StepUrlResolver $stepUrlResolver,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->questionnaireRepo = $questionnaireRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->responsesFormatter = $responsesFormatter;
        $this->logger = $logger;
        $this->userNotifier = $userNotifier;
        $this->stepUrlResolver = $stepUrlResolver;
        $this->questionnaireReplyNotifier = $questionnaireReplyNotifier;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $values = $input->getRawArguments();

        $questionnaireId = GlobalId::fromGlobalId($values['questionnaireId'])['id'];

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->questionnaireRepo->find($questionnaireId);
        unset($values['questionnaireId']);

        if (!$questionnaire->canContribute($user)) {
            throw new UserError('You can no longer contribute to this questionnaire step.');
        }

        if (!$questionnaire->isMultipleRepliesAllowed()) {
            $previousReply = $this->replyRepo->getOneForUserAndQuestionnaire($questionnaire, $user);
            if ((bool) $previousReply) {
                throw new UserError('Only one reply by user is allowed for this questionnaire.');
            }
        }

        if ($questionnaire->isPhoneConfirmationRequired() && !$user->isPhoneConfirmed()) {
            throw new UserError('You must confirm your account via sms to post a reply.');
        }

        $reply = (new Reply())->setAuthor($user)->setQuestionnaire($questionnaire);
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

        $this->redisStorageHelper->recomputeUserCounters($user);
        if (
            $questionnaire->isAcknowledgeReplies() &&
            !$reply->isDraft() &&
            $questionnaire->getStep()
        ) {
            $step = $questionnaire->getStep();
            $project = $step->getProject();
            $endAt = $step->getEndAt();
            $stepUrl = $this->stepUrlResolver->__invoke($step);
            if ($questionnaire->isNotifyResponseCreate()) {
                $this->questionnaireReplyNotifier->onCreation($reply, $stepUrl);
            }
            $this->userNotifier->acknowledgeReply(
                $project,
                $reply,
                $endAt,
                $stepUrl,
                $step,
                $user,
                false
            );
        }

        return ['questionnaire' => $questionnaire, 'reply' => $reply];
    }

    private function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error((string) $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }
}
