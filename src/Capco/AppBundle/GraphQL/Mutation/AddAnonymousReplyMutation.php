<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class AddAnonymousReplyMutation implements MutationInterface
{
    use MutationTrait;

    final public const INVALID_FORM = 'INVALID_FORM';

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly ResponsesFormatter $responsesFormatter, private readonly LoggerInterface $logger, private readonly RequestGuesserInterface $requestGuesser, private readonly TokenGeneratorInterface $tokenGenerator, private readonly GlobalIdResolver $globalIdResolver, private readonly Publisher $publisher, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->globalIdResolver->resolve($values['questionnaireId'], null);
        unset($values['questionnaireId']);

        $participantEmail = $values['participantEmail'] ?? null;

        $token = $this->tokenGenerator->generateToken();

        $replyAnonymous = (new ReplyAnonymous())
            ->setQuestionnaire($questionnaire)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setToken($token)
            ->setParticipantEmail($participantEmail)
            ->setPublishedAt(new \DateTime('now'))
        ;

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyAnonymousType::class, $replyAnonymous);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));

            return [
                'questionnaire' => $questionnaire,
                'reply' => null,
                'token' => null,
                'errorCode' => self::INVALID_FORM,
            ];
        }

        $this->em->persist($replyAnonymous);
        $this->em->flush();
        $this->indexer->index(ReplyAnonymous::class, $replyAnonymous->getId());
        $this->indexer->finishBulk();

        if ($questionnaire->isNotifyResponseCreate() || $replyAnonymous->getParticipantEmail()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'replyId' => $replyAnonymous->getId(),
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    ])
                )
            );
        }

        return [
            'questionnaire' => $questionnaire,
            'reply' => $replyAnonymous,
            'token' => $token,
            'errorCode' => null,
        ];
    }
}
