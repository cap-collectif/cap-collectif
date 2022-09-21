<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class InviteOrganizationMemberMutation implements MutationInterface
{
    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    public const USER_ALREADY_MEMBER = 'USER_ALREADY_MEMBER';
    public const USER_ALREADY_INVITED = 'USER_ALREADY_INVITED';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private UserRepository $userRepository;
    private PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository;
    private TokenGeneratorInterface $tokenGenerator;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        UserRepository $userRepository,
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        TokenGeneratorInterface $tokenGenerator
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->userRepository = $userRepository;
        $this->pendingOrganizationInvitationRepository = $pendingOrganizationInvitationRepository;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        list($organizationId, $email, $role) = $this->getData($input);
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);
        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }

        $user = $this->userRepository->findOneByEmail($email);
        if ($user instanceof User && $organization->isUserAlreadyMember($user)) {
            return ['errorCode' => self::USER_ALREADY_MEMBER];
        }
        if ($this->isUserAlreadyInvited($organization, $user, $email)) {
            return ['errorCode' => self::USER_ALREADY_INVITED];
        }

        $invitation = $this->invite($user, $email, $organization, $role, $viewer);

        // TODO : send email

        return ['invitation' => $invitation];
    }

    private function isUserAlreadyInvited(
        Organization $organization,
        ?User $user,
        ?string $email = null
    ): bool {
        return (bool)$this->pendingOrganizationInvitationRepository->findOneByEmailOrUserAndOrganization(
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

    private function invite(?User $user, ?string $email, Organization $organization, string $role, User $viewer): PendingOrganizationInvitation
    {
        $token = $this->tokenGenerator->generateToken();
        $invitation = PendingOrganizationInvitation::makeInvitation($organization, $role, $token, $viewer, $user, $email);
        $this->em->persist($invitation);
        $this->em->flush();

        return $invitation;
    }
}
