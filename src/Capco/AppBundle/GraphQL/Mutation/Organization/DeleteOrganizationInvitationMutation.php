<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\PendingOrganizationInvitationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteOrganizationInvitationMutation implements MutationInterface
{
    public const INVITATION_NOT_FOUND = 'INVITATION_NOT_FOUND';

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(GlobalIdResolver $globalIdResolver, EntityManagerInterface $em, AuthorizationCheckerInterface $authorizationChecker)
    {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $pendingOrganizationInvitationId = $input->offsetGet('invitationId');
        $pendingOrganizationInvitation = $this->globalIdResolver->resolve($pendingOrganizationInvitationId, $viewer);

        if (!$pendingOrganizationInvitation) {
            return ['errorCode' => self::INVITATION_NOT_FOUND];
        }

        $this->em->remove($pendingOrganizationInvitation);
        $this->em->flush();

        return ['invitationId' => $pendingOrganizationInvitationId];
    }

    public function isGranted(string $pendingOrganizationInvitationId, User $viewer): bool
    {
        $pendingOrganizationInvitation = $this->globalIdResolver->resolve($pendingOrganizationInvitationId , $viewer);
        if (!$pendingOrganizationInvitation) {
            return false;
        }

        return $this->authorizationChecker->isGranted(PendingOrganizationInvitationVoter::DELETE, $pendingOrganizationInvitation);
    }
}