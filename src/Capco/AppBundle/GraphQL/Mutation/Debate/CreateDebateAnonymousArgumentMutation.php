<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Swarrot\Broker\Message;

class CreateDebateAnonymousArgumentMutation extends CreateDebateArgumentMutation
{
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
                ->setToken($this->tokenGenerator->generateToken());
            if (true === $input->offsetGet('consentInternalCommunication')) {
                $this->pushToSendinblue([
                    'email' => $input->offsetGet('email'),
                    'data' => [
                        'DEBATS_PROJETS' => $debate->getProject()->getTitle(),
                    ],
                ]);
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

    private function pushToSendinblue(array $args): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => 'addEmailToSendinblue',
                    'args' => $args,
                ])
            )
        );
    }
}
