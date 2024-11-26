<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Notifier\DebateNotifier;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateDebateAnonymousArgumentMutation extends CreateDebateArgumentMutation
{
    private readonly SendInBluePublisher $sendInBluePublisher;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        DebateArgumentRepository $repository,
        DebateAnonymousArgumentRepository $anonymousRepository,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer,
        ValidatorInterface $validator,
        TokenGeneratorInterface $tokenGenerator,
        DebateNotifier $debateNotifier,
        RequestGuesser $requestGuesser,
        SendInBluePublisher $sendInBluePublisher
    ) {
        $this->sendInBluePublisher = $sendInBluePublisher;
        parent::__construct(
            $em,
            $globalIdResolver,
            $repository,
            $anonymousRepository,
            $authorizationChecker,
            $indexer,
            $validator,
            $tokenGenerator,
            $debateNotifier,
            $requestGuesser
        );
    }

    public function __invoke(Arg $input, ?User $viewer = null): array
    {
        try {
            $debate = $this->getDebateFromInput($input, null);
            self::checkDebateIsOpen($debate);
            $this->checkCreateRights($debate, null, $input);

            $debateArgument = (new DebateAnonymousArgument($debate))
                ->setEmail($input->offsetGet('email'))
                ->setUsername($input->offsetGet('username'))
                ->setConsentInternalCommunication($input->offsetGet('consentInternalCommunication'))
                ->setToken($this->tokenGenerator->generateToken())
            ;
            if (true === $input->offsetGet('consentInternalCommunication')) {
                $this->sendInBluePublisher->pushToSendinblue(
                    'addEmailToSendInBlue',
                    [
                        'email' => $input->offsetGet('email'),
                        'data' => ['DEBATS_PROJETS' => $debate->getProject()->getTitle()],
                    ]
                );
            }

            self::setDebateArgumentOrigin($debateArgument, $input);
            self::setDebateArgumentContent($debateArgument, $input);

            $this->saveAndIndex($debateArgument);
            $this->debateNotifier->sendArgumentConfirmation($debateArgument);
            $token = $debateArgument->getToken();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument', 'token');
    }
}
