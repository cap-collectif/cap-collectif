<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class InviteOrganizationMemberMutation extends AbstractOrgnizationInvitation
{
    public const USER_ALREADY_EXISTING = 'USER_ALREADY_EXISTING';

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
        list($organization, $email, $role) = $this->getData($input, $viewer);

        try {
            $this->canInviteUser($organization, null, $email);
        } catch (\Exception $exception) {
            return ['errorCode' => $exception->getMessage()];
        }

        $invitation = $this->invite(null, $email, $organization, $role, $viewer);

        // user not exist, send an invitation for registration
        $this->inviteUserToRegister($invitation);

        return ['invitation' => $invitation];
    }

    private function getData(Argument $input, $viewer): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $email = $input->offsetGet('email');
        $role = $input->offsetGet('role');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        return [$organization, $email, $role];
    }

    protected function canInviteUser(?Organization $organization, ?User $user, ?string $email): void
    {
        $user = $this->userRepository->findOneByEmail($email);
        if ($user instanceof User) {
            throw new \RuntimeException(self::USER_ALREADY_EXISTING);
        }

        parent::canInviteUser($organization, $user, $email);
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
        $redirection = $this->router->generate(
            'capco_app_user_invitation',
            ['token' => $invitation->getToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
        $userInvite = UserInvite::invite(
            $invitation->getEmail(),
            false,
            false,
            $invitation->getToken(),
            $message,
            $redirection
        );
        $emailMessage = new UserInviteEmailMessage($userInvite);
        $emailMessage->setMessageType(
            CapcoAppBundleMessagesTypes::USER_INVITE_INVITATION_BY_ORGANIZATION
        );
        // on UserInviteEmailMessageListener postPersist send email to invite user
        $userInvite->addEmailMessage($emailMessage);

        $this->em->persist($userInvite);
        $this->em->flush();
    }
}
