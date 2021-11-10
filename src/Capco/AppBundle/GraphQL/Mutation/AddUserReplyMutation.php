<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
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

class AddUserReplyMutation implements MutationInterface
{
    public const REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private QuestionnaireRepository $questionnaireRepo;
    private ResponsesFormatter $responsesFormatter;
    private LoggerInterface $logger;
    private ReplyRepository $replyRepo;
    private Publisher $publisher;
    private RequestGuesser $requestGuesser;
    private StepRequirementsResolver $stepRequirementsResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ReplyRepository $replyRepo,
        QuestionnaireRepository $questionnaireRepo,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        Publisher $publisher,
        RequestGuesser $requestGuesser,
        StepRequirementsResolver $stepRequirementsResolver
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->replyRepo = $replyRepo;
        $this->questionnaireRepo = $questionnaireRepo;
        $this->responsesFormatter = $responsesFormatter;
        $this->logger = $logger;
        $this->publisher = $publisher;
        $this->requestGuesser = $requestGuesser;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
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

        $step = $questionnaire->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($user, $step)
        ) {
            $this->logger->error(
                sprintf(
                    '%s : You dont meets all the requirements. user => %s; on step => %s',
                    __METHOD__,
                    $user->getId(),
                    $step->getId()
                )
            );

            return [
                'questionnaire' => $questionnaire,
                'reply' => null,
                'errorCode' => self::REQUIREMENTS_NOT_MET,
            ];
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

        return ['questionnaire' => $questionnaire, 'reply' => $reply, 'errorCode' => null];
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
