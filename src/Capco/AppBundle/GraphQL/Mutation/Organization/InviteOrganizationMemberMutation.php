<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Contracts\Translation\TranslatorInterface;

class InviteOrganizationMemberMutation implements MutationInterface
{
    use MutationTrait;

    final public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    final public const USER_ALREADY_MEMBER = 'USER_ALREADY_MEMBER';
    final public const USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION = 'USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION';
    final public const USER_ALREADY_INVITED = 'USER_ALREADY_INVITED';
    final public const USER_NOT_ONLY_ROLE_USER = 'USER_NOT_ONLY_ROLE_USER';

    public function __construct(private readonly EntityManagerInterface $em, private readonly GlobalIdResolver $globalIdResolver, private readonly UserRepository $userRepository, private readonly PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository, private readonly TokenGeneratorInterface $tokenGenerator, private readonly TranslatorInterface $translator, private readonly SiteParameterResolver $siteParameter, private readonly Publisher $publisher, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        [$organizationId, $email, $role] = $this->getData($input);
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);
        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }

        $user = $this->userRepository->findOneByEmail($email);

        // we can only invite user with ROLE_USER
        if ($user instanceof User && $user->isProjectAdmin()) {
            return ['errorCode' => self::USER_NOT_ONLY_ROLE_USER];
        }

        if ($user instanceof User && $organization->isUserMember($user)) {
            return ['errorCode' => self::USER_ALREADY_MEMBER];
        }

        if ($user instanceof User && $user->isOrganizationMember()) {
            return ['errorCode' => self::USER_ALREADY_MEMBER_OF_ANOTHER_ORGANIZATION];
        }
        if ($this->isUserAlreadyInvited($organization, $user, $email)) {
            return ['errorCode' => self::USER_ALREADY_INVITED];
        }

        $invitation = $this->invite($user, $email, $organization, $role, $viewer);

        // user not exist, send an invitation for registration
        if (!$invitation->getUser()) {
            $this->inviteUserToRegister($invitation);

            return ['invitation' => $invitation];
        }

        try {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::ORGANIZATION_MEMBER_INVITATION,
                new Message(
                    json_encode([
                        'id' => $invitation->getId(),
                    ])
                )
            );
        } catch (\RuntimeException) {
            $this->logger->error(__CLASS__ . ': could not publish to rabbitmq.');
        }

        return ['invitation' => $invitation];
    }

    private function isUserAlreadyInvited(
        Organization $organization,
        ?User $user,
        ?string $email = null
    ): bool {
        return (bool) $this->pendingOrganizationInvitationRepository->findOneByEmailOrUserAndOrganization(
            $organization,
            $user,
            $email
        );
    }

    private function getData(Argument $input): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $email = $input->offsetGet('email');
        $role = $input->offsetGet('role');

        return [$organizationId, $email, $role];
    }

    private function invite(
        ?User $user,
        ?string $email,
        Organization $organization,
        string $role,
        User $viewer
    ): PendingOrganizationInvitation {
        $token = $this->tokenGenerator->generateToken();
        $invitation = PendingOrganizationInvitation::makeInvitation(
            $organization,
            $role,
            $token,
            $viewer,
            $user,
            $email
        );
        $this->em->persist($invitation);
        $this->em->flush();

        return $invitation;
    }

    private function inviteUserToRegister(PendingOrganizationInvitation $invitation): void
    {
        $message = $this->translator->trans(
            'organization_invitation.content',
            [
                'plateformName' => AbstractMessage::escape(
                    $this->siteParameter->getValue('global.site.fullname')
                ),
            ],
            'CapcoAppBundle'
        );

        $userInvite = UserInvite::invite(
            $invitation->getEmail(),
            false,
            false,
            $invitation->getToken(),
            $message,
        )->setOrganization($invitation->getOrganization());
        $emailMessage = new UserInviteEmailMessage($userInvite);
        $emailMessage->setMessageType(CapcoAppBundleMessagesTypes::USER_INVITE_INVITATION_BY_ORGANIZATION);
        // on UserInviteEmailMessageListener postPersist send email to invite user
        $userInvite->addEmailMessage($emailMessage);

        $this->em->persist($userInvite);
        $this->em->flush();
    }
}
