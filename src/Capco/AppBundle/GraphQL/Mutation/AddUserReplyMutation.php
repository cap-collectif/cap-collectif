<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddUserReplyMutation implements MutationInterface
{
    use MutationTrait;

    final public const REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET';

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly ReplyRepository $replyRepo, private readonly GlobalIdResolver $globalIdResolver, private readonly ResponsesFormatter $responsesFormatter, private readonly LoggerInterface $logger, private readonly Publisher $publisher, private readonly RequestGuesserInterface $requestGuesser, private readonly StepRequirementsResolver $stepRequirementsResolver, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->globalIdResolver->resolve($values['questionnaireId'], $user);
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
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($user, $step)
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
            ->setIpAddress($this->requestGuesser->getClientIp())
        ;

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
        $this->indexer->index(Reply::class, $reply->getId());
        $this->indexer->finishBulk();

        if (!$reply->isDraft()) {
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
