<?php

namespace Capco\AppBundle\GraphQL\Mutation\Security;

use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteUserIdentificationCodeListMutation implements MutationInterface
{
    use MutationTrait;

    public const NOT_FOUND = 'NOT_FOUND';

    private EntityManagerInterface $em;
    private UserIdentificationCodeListRepository $repository;

    public function __construct(
        EntityManagerInterface $em,
        UserIdentificationCodeListRepository $repository
    ) {
        $this->em = $em;
        $this->repository = $repository;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $globalId = $input->offsetGet('id');

        try {
            $list = $this->getList($globalId);
            $this->deleteList($list);

            return ['deletedUserIdentificationCodeListId' => $globalId];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function deleteList(UserIdentificationCodeList $list): void
    {
        $this->em->remove($list);
        $this->em->flush();
    }

    private function getList(string $globalId): UserIdentificationCodeList
    {
        $decoded = GlobalId::fromGlobalId($globalId);
        if ($decoded['id']) {
            $list = $this->repository->find($decoded['id']);
            if ($list) {
                return $list;
            }
        }

        throw new UserError(self::NOT_FOUND);
    }
}
