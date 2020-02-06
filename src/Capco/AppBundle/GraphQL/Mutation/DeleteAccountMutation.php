<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\UserBundle\Doctrine\UserManager;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Sonata\MediaBundle\Provider\ImageProvider;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\UserGroupRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Translation\TranslatorInterface;

class DeleteAccountMutation extends BaseDeleteUserMutation
{
    private $userRepository;

    public function __construct(
        EntityManagerInterface $em,
        TranslatorInterface $translator,
        UserRepository $userRepository,
        UserGroupRepository $groupRepository,
        UserManager $userManager,
        RedisStorageHelper $redisStorageHelper,
        ImageProvider $mediaProvider,
        ProposalAuthorDataLoader $proposalAuthorDataLoader
    ) {
        parent::__construct(
            $em,
            $mediaProvider,
            $translator,
            $redisStorageHelper,
            $groupRepository,
            $userManager,
            $proposalAuthorDataLoader
        );
        $this->userRepository = $userRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $deleteType = $input['type'];
        $user = $viewer;

        if ($viewer->isSuperAdmin() && isset($input['userId'])) {
            $userId = GlobalId::fromGlobalId($input['userId'])['id'];
            $user = $this->userRepository->find($userId);
            if (!$user) {
                throw new UserError('Can not find this userId !');
            }
        }
        if (DeleteAccountType::HARD === $deleteType && $user) {
            $this->hardDeleteUserContributionsInActiveSteps($user);
            //in order not to reference dead relationships between entities
            $this->em->refresh($user);
        }
        $this->anonymizeUser($user);
        $this->em->refresh($user);
        $this->softDelete($user);

        $this->em->flush();

        return ['userId' => GlobalId::toGlobalId('User', $user->getId())];
    }
}
