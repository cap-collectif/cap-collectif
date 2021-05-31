<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class InviteUsersMutation implements MutationInterface
{
    private const EXPIRES_AT_PERIOD = '+ 7 days';
    private const BATCH_SIZE = 800;

    private TokenGeneratorInterface $tokenGenerator;
    private EntityManagerInterface $em;
    private UserInviteRepository $userInviteRepository;
    private UserRepository $userRepository;
    private GroupRepository $groupRepository;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        EntityManagerInterface $em,
        UserInviteRepository $userInviteRepository,
        UserRepository $userRepository,
        GroupRepository $groupRepository
    ) {
        $this->tokenGenerator = $tokenGenerator;
        $this->em = $em;
        $this->userInviteRepository = $userInviteRepository;
        $this->userRepository = $userRepository;
        $this->groupRepository = $groupRepository;
    }

    public function __invoke(Argument $args): array
    {
        list($emails, $isAdmin, $maxResults, $groupIds) = [
            array_filter($args->offsetGet('emails')),
            $args->offsetGet('isAdmin'),
            $args->offsetGet('maxResults'),
            $args->offsetGet('groups'),
        ];

        $existingInviteEmails = $this->userInviteRepository->findAllEmails();
        $existingUserEmails = $this->userRepository->findByEmails($emails);
        $toUpdateEmails = [];
        $newInvitations = [];

        $groupEntities = array_map(function($groupId){
            return $this->groupRepository->find($groupId);
        }, $groupIds);

        $insertions = 0;
        foreach ($emails as $email) {
            if (\in_array($email, $existingInviteEmails, true)) {
                $toUpdateEmails[] = $email;

                continue;
            }
            if (\in_array($email, $existingUserEmails, true)) {
                continue;
            }
            $invitation = (new UserInvite())
                ->setEmail($email)
                ->setIsAdmin($isAdmin)
                ->setToken($this->tokenGenerator->generateToken())
                ->setExpiresAt((new \DateTimeImmutable())->modify(self::EXPIRES_AT_PERIOD))
            ;

            foreach ($groupEntities as $groupEntity) {
                $invitation->addGroup($groupEntity);
            }

            $newInvitations[] = $invitation;
            $this->em->persist($invitation);
            ++$insertions;
            if (0 === $insertions % self::BATCH_SIZE) {
                $this->em->flush();
                $this->em->clear();
            }
        }

        $this->em->flush();
        $this->em->clear();

        if (\count($toUpdateEmails) > 0) {
            foreach ($toUpdateEmails as $email) {
                /** * @var $userInvite UserInvite  */
                $userInvite = $this->userInviteRepository->findOneBy(['email' => $email]);
                $userInvite->setExpiresAt(new \DateTimeImmutable(self::EXPIRES_AT_PERIOD));
                $userInvite->setIsAdmin($isAdmin);
                $userInvite->setGroups(new ArrayCollection($groupEntities));
                $this->em->persist($userInvite);
            }
        }

        $offset = 0;
        $newInvitations = array_map(function (UserInvite $invite) use (&$offset) {
            return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
        }, $newInvitations);
        $newInvitations = \array_slice($newInvitations, 0, $maxResults);

        $offset = 0;
        $updatedInvitations =
            0 === \count($toUpdateEmails)
                ? []
                : array_map(function (UserInvite $invite) use (&$offset) {
                    return new Edge(ConnectionBuilder::offsetToCursor($offset++), $invite);
                }, $this->userInviteRepository->findByEmails($toUpdateEmails));
        $updatedInvitations = \array_slice($updatedInvitations, 0, $maxResults);

        return compact('newInvitations', 'updatedInvitations');
    }
}
