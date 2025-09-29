<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class TrashMutation implements MutationInterface
{
    use MutationTrait;

    final public const TRASHABLE_NOT_FOUND = 'TRASHABLE_NOT_FOUND';

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly Indexer $indexer
    ) {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $trashable = $this->getTrashable($input, $viewer);
            self::trash($trashable, $input);
            $this->em->flush();
            $this->reindex($trashable);

            return ['trashable' => $trashable];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getTrashable(Arg $input, User $viewer): Trashable
    {
        $trashable = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);
        if (!($trashable instanceof Trashable)) {
            throw new UserError(self::TRASHABLE_NOT_FOUND);
        }

        return $trashable;
    }

    private function reindex(Trashable $trashable): void
    {
        if ($trashable instanceof IndexableInterface) {
            $this->indexer->index(ClassUtils::getClass($trashable), $trashable->getId());
            $this->indexer->finishBulk();
        }
    }

    private static function trash(Trashable $trashable, Arg $input): Trashable
    {
        $trashable->setTrashedStatus($input->offsetGet('trashedStatus'));
        $trashable->setTrashedReason(strip_tags((string) $input->offsetGet('trashedReason')));

        return $trashable;
    }
}
