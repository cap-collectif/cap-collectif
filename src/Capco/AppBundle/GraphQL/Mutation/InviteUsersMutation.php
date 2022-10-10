<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Interfaces\DateTime\Expirable;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class InviteUsersMutation implements MutationInterface
{
    private const BATCH_SIZE = 800;

    private TokenGeneratorInterface $tokenGenerator;
    private EntityManagerInterface $em;
    private UserInviteRepository $userInviteRepository;
    private UserRepository $userRepository;
    private GroupRepository $groupRepository;
    private Manager $manager;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        EntityManagerInterface $em,
        UserInviteRepository $userInviteRepository,
        UserRepository $userRepository,
        GroupRepository $groupRepository,
        Manager $manager
    ) {
        $this->tokenGenerator = $tokenGenerator;
        $this->em = $em;
        $this->userInviteRepository = $userInviteRepository;
        $this->userRepository = $userRepository;
        $this->groupRepository = $groupRepository;
        $this->manager = $manager;
    }

    public function __invoke(Argument $args): array
    {
        list($emails, $role, $maxResults, $groupIds, $message, $redirectionUrl) = [
            array_filter($args->offsetGet('emails')),
            $args->offsetGet('role'),
            $args->offsetGet('maxResults'),
            $args->offsetGet('groups'),
            $args->offsetGet('message'),
            $args->offsetGet('redirectionUrl'),
        ];

        $hostname = getenv('SYMFONY_ROUTER__REQUEST_CONTEXT__HOST');
        if ($redirectionUrl && !preg_match('/' . $hostname . '/i', $redirectionUrl)) {
            throw new UserError(
                'The hostname provided does not match a platform name from Cap Collectif'
            );
        }

        if (null !== $message && mb_strlen($message) > 500) {
            throw new UserError('The message length cannot exceed 500 characters.');
        }

        $isAdmin = UserRole::ROLE_ADMIN === $role;
        $isProjectAdmin =
            $this->manager->isActive(Manager::unstable__project_admin) &&
            UserRole::ROLE_PROJECT_ADMIN === $role;

        $existingInviteEmails = $this->userInviteRepository->findAllEmails();
        $existingUserEmails = $this->userRepository->findByEmails($emails);

        $groupIds = array_map(static function (string $groupId) {
            return GlobalId::fromGlobalId($groupId)['id'];
        }, $groupIds);
        $groupEntities = $this->groupRepository->findBy(['id' => $groupIds]);
        $toUpdateEmails = [];
        $newInvitations = [];

        $insertions = 0;
        foreach ($emails as $email) {
            if (\in_array($email, $existingInviteEmails, true)) {
                $toUpdateEmails[] = $email;

                continue;
            }
            if (\in_array($email, $existingUserEmails, true)) {
                continue;
            }
            $invitation = UserInvite::invite(
                $email,
                $isAdmin,
                $isProjectAdmin,
                $this->tokenGenerator->generateToken(),
                $message,
                $redirectionUrl
            );

            $invitation->addEmailMessage(new UserInviteEmailMessage($invitation));

            foreach ($groupEntities as $groupEntity) {
                $invitation->addGroup($groupEntity);
            }

            $newInvitations[] = $invitation;
            $this->em->persist($invitation);
            ++$insertions;
            if (0 === $insertions % self::BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear(UserInvite::class);
            }
        }
        // to delete 

        $this->em->flush();
        $this->em->clear(UserInvite::class);

        if (\count($toUpdateEmails) > 0) {
            $userInvites = $this->userInviteRepository->findBy(['email' => $toUpdateEmails]);
            foreach ($userInvites as $userInvite) {
                $userInvite
                    ->setExpiresAt(new \DateTimeImmutable(Expirable::EXPIRES_AT_PERIOD))
                    ->setIsAdmin($isAdmin)
                    ->setIsProjectAdmin($isProjectAdmin)
                    ->setGroups(new ArrayCollection($groupEntities))
                    ->setMessage($message)
                    ->setRedirectionUrl($redirectionUrl);
            }
            $this->em->flush();
        }

        $offset = 0;
        $newInvitations = array_map(static function (UserInvite $invite) use (&$offset) {
            return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
        }, $newInvitations);
        $newInvitations = \array_slice($newInvitations, 0, $maxResults);

        $offset = 0;
        $updatedInvitations =
            0 === \count($toUpdateEmails)
                ? []
                : array_map(static function (UserInvite $invite) use (&$offset) {
                    return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
                }, $this->userInviteRepository->findByEmails($toUpdateEmails));
        $updatedInvitations = \array_slice($updatedInvitations, 0, $maxResults);

        return compact('newInvitations', 'updatedInvitations');
    }
}
