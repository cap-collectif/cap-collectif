<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\OrganizationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class KickFromOrganizationMutation implements MutationInterface
{
    use MutationTrait;

    final public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    final public const USER_NOT_MEMBER = 'USER_NOT_MEMBER';

    private readonly GlobalIdResolver $resolver;
    private readonly EntityManagerInterface $manager;
    private readonly AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $manager,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->resolver = $resolver;
        $this->manager = $manager;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $organization = $this->getOrganization($input, $viewer);
            $user = $this->getUser($input, $viewer);
            self::checkIsMemberOfOrganization($organization, $user);
            $deletedMemberShipId = $this->doKick($organization, $user);

            return compact('deletedMemberShipId');
        } catch (UserError $exception) {
            return ['errorCode' => $exception->getMessage()];
        }
    }

    private function doKick(Organization $organization, User $user): string
    {
        $memberShipToCancel = null;
        foreach ($organization->getMembers() as $memberShip) {
            if ($memberShip->getUser() === $user) {
                $memberShipToCancel = $memberShip;

                break;
            }
        }

        $memberShipToCancelId = GlobalId::toGlobalId('OrganizationMember', $memberShipToCancel->getId());

        $organization->removeMember($memberShipToCancel);
        $this->manager->remove($memberShipToCancel);
        $this->manager->flush();

        return $memberShipToCancelId;
    }

    private function getOrganization(Argument $input, User $viewer): Organization
    {
        $organization = $this->resolver->resolve(
            $input->offsetGet('organizationId'),
            $viewer
        );

        if ($organization && $this->authorizationChecker->isGranted(OrganizationVoter::KICK, $organization)) {
            return $organization;
        }

        throw new UserError(self::ORGANIZATION_NOT_FOUND);
    }

    private function getUser(Argument $input, User $viewer): User
    {
        $user = $this->resolver->resolve(
            $input->offsetGet('userId'),
            $viewer
        );

        if (null === $user) {
            throw new UserError(self::USER_NOT_MEMBER);
        }

        return $user;
    }

    private static function checkIsMemberOfOrganization(Organization $organization, User $user): void
    {
        if (!$organization->isUserMember($user)) {
            throw new UserError(self::USER_NOT_MEMBER);
        }
    }
}
