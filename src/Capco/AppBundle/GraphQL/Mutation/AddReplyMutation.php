<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
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
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Capco\AppBundle\Utils\RequestGuesser;

class AddReplyMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private QuestionnaireRepository $questionnaireRepo;
    private ResponsesFormatter $responsesFormatter;
    private LoggerInterface $logger;
    private ReplyRepository $replyRepo;
    private UserNotifier $userNotifier;
    private StepUrlResolver $stepUrlResolver;
    private Publisher $publisher;
    private RequestGuesser $requestGuesser;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        QuestionnaireRepository $questionnaireRepo,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        UserNotifier $userNotifier,
        StepUrlResolver $stepUrlResolver,
        Publisher $publisher,
        RequestGuesser $requestGuesser
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->questionnaireRepo = $questionnaireRepo;
        $this->responsesFormatter = $responsesFormatter;
        $this->logger = $logger;
        $this->userNotifier = $userNotifier;
        $this->stepUrlResolver = $stepUrlResolver;
        $this->publisher = $publisher;
        $this->requestGuesser = $requestGuesser;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $values = $input->getArrayCopy();

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

        $reply = (new Reply())
            ->setAuthor($user)
            ->setQuestionnaire($questionnaire)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp());

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

        if ($questionnaire && !$reply->isDraft()) {
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

        return ['questionnaire' => $questionnaire, 'reply' => $reply];
    }

    private function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }
}
