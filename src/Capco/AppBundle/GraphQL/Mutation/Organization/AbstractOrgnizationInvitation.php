<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use http\Exception\RuntimeException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class AbstractOrgnizationInvitation implements MutationInterface
{
    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    public const USER_ALREADY_MEMBER = 'USER_ALREADY_MEMBER';
    public const USER_ALREADY_INVITED = 'USER_ALREADY_INVITED';

    protected EntityManagerInterface $em;
    protected GlobalIdResolver $globalIdResolver;
    protected UserRepository $userRepository;
    protected PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository;
    protected TokenGeneratorInterface $tokenGenerator;
    protected TranslatorInterface $translator;
    protected SiteParameterResolver $siteParameter;
    protected RouterInterface $router;
    protected Publisher $publisher;
    protected LoggerInterface $logger;

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
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->userRepository = $userRepository;
        $this->pendingOrganizationInvitationRepository = $pendingOrganizationInvitationRepository;
        $this->tokenGenerator = $tokenGenerator;
        $this->translator = $translator;
        $this->siteParameter = $siteParameter;
        $this->router = $router;
        $this->publisher = $publisher;
        $this->logger = $logger;
    }

    protected function isUserAlreadyInvited(
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

    protected function invite(
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

    protected function canInviteUser(?Organization $organization, ?User $user, ?string $email): void
    {
        if (!$organization instanceof Organization) {
            throw new \RuntimeException(self::ORGANIZATION_NOT_FOUND);
        }
        if ($user instanceof User && $organization->isUserAlreadyMember($user)) {
            throw new \RuntimeException(self::USER_ALREADY_MEMBER);
        }
        if ($this->isUserAlreadyInvited($organization, $user, $email)) {
            throw new \RuntimeException(self::USER_ALREADY_INVITED);
        }
    }
}
