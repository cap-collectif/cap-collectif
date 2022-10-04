<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class InviteUserToOrganizationMutation extends AbstractOrgnizationInvitation
{
    public const USER_NOT_FOUND = 'USER_NOT_FOUND';

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        UserRepository $userRepository,
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        TokenGeneratorInterface $tokenGenerator,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParameter,
        RouterInterface $router,
        Publisher $publisher,
        LoggerInterface $logger
    ) {
        parent::__construct(
            $em,
            $globalIdResolver,
            $userRepository,
            $pendingOrganizationInvitationRepository,
            $tokenGenerator,
            $translator,
            $siteParameter,
            $router,
            $publisher,
            $logger
        );
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        list($organization, $user, $role) = $this->getData($input, $viewer);

        try {
            $this->canInviteUser($organization, $user, null);
        } catch (\Exception $exception) {
            return ['errorCode' => $exception->getMessage()];
        }

        $invitation = $this->invite($user, null, $organization, $role, $viewer);

        try {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::ORGANIZATION_MEMBER_INVITATION,
                new Message(
                    json_encode([
                        'id' => $invitation->getId(),
                    ])
                )
            );
        } catch (\RuntimeException $exception) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }

        return ['invitation' => $invitation];
    }

    protected function canInviteUser(?Organization $organization, ?User $user, ?string $email): void
    {
        parent::canInviteUser($organization, $user,$email);

        if(!$user instanceof User) {
            throw new \RuntimeException(self::USER_NOT_FOUND);
        }
    }

    private function getData(Argument $input, $viewer): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $user = $input->offsetGet('user');
        $role = $input->offsetGet('role');
        $user = $this->globalIdResolver->resolve($user, $viewer);
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        return [$organization, $user, $role];
    }
}
