<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;

class DeleteArgumentMutation
{
    private $em;
    private $argumentRepo;
    private $redisStorage;

    public function __construct(
        EntityManagerInterface $em,
        ArgumentRepository $argumentRepo,
        RedisStorageHelper $redisStorage
    ) {
        $this->em = $em;
        $this->argumentRepo = $argumentRepo;
        $this->redisStorage = $redisStorage;
    }

    public function __invoke(Arg $input, User $user): array
    {
        $argumentId = $input->offsetGet('argumentId');
        /** @var Argument $argument */
        $argument = $this->argumentRepo->find($argumentId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $argumentId);
        }

        if ($user !== $argument->getAuthor()) {
            throw new UserError('You are not the author of argument with id: ' . $argumentId);
        }

        if (!$argument->canBeDeleted($user)) {
            throw new UserError('Uncontributable argument.');
        }

        $argumentable = $argument->getRelated();

        // Sync ?
        $argumentable->decreaseArgumentsCount();

        $this->em->remove($argument);
        $this->em->flush();
        $this->redisStorage->recomputeUserCounters($user);

        return ['argumentable' => $argumentable, 'deletedArgumentId' => $argumentId];
    }
}
