<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Form\ReplyAnonymousType;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserErrors;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Capco\AppBundle\Utils\RequestGuesser;

class AddAnonymousReplyMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private ResponsesFormatter $responsesFormatter;
    private LoggerInterface $logger;
    private RequestGuesser $requestGuesser;
    private TokenGeneratorInterface $tokenGenerator;
    private QuestionnaireRepository $questionnaireRepository;


    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        LoggerInterface $logger,
        RequestGuesser $requestGuesser,
        TokenGeneratorInterface $tokenGenerator,
        QuestionnaireRepository $questionnaireRepository
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->responsesFormatter = $responsesFormatter;
        $this->logger = $logger;
        $this->requestGuesser = $requestGuesser;
        $this->tokenGenerator = $tokenGenerator;
        $this->questionnaireRepository = $questionnaireRepository;
    }

    public function __invoke(Argument $input): array
    {
        $values = $input->getArrayCopy();

        $questionnaireId = GlobalId::fromGlobalId($values['questionnaireId'])['id'];

        /** @var Questionnaire $questionnaire */
        $questionnaire = $this->questionnaireRepository->find($questionnaireId);
        unset($values['questionnaireId']);

        $participantEmail = $values['participantEmail'] ?? null;

        $token = $this->tokenGenerator->generateToken();

        $replyAnonymous = (new ReplyAnonymous())
            ->setQuestionnaire($questionnaire)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setToken($token)
            ->setParticipantEmail($participantEmail)
            ->setPublishedAt(new \DateTime('now'));

        $values['responses'] = $this->responsesFormatter->format($values['responses']);

        $form = $this->formFactory->create(ReplyAnonymousType::class, $replyAnonymous);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }

        $this->em->persist($replyAnonymous);
        $this->em->flush();

        return ['questionnaire' => $questionnaire, 'reply' => $replyAnonymous, 'token' => $token];
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
