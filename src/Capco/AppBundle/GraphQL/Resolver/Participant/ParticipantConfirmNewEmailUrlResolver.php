<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ParticipantConfirmNewEmailUrlResolver implements ResolverInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    public function __invoke(Participant $participant, string $redirectUrl, string $participationCookies): ?string
    {
        $token = $participant->getNewEmailConfirmationToken();

        $parameters = ['token' => $token, 'redirectUrl' => $redirectUrl, 'participationCookies' => $participationCookies];

        return $token
            ? $this->router->generate(
                'participant_confirm_new_email',
                $parameters,
                UrlGeneratorInterface::ABSOLUTE_URL
            )
            : null;
    }
}
