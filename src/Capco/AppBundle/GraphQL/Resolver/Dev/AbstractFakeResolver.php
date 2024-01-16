<?php

namespace Capco\AppBundle\GraphQL\Resolver\Dev;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * Extends this abstract class to fake a resolver with "random" data.
 */
abstract class AbstractFakeResolver implements QueryInterface
{
    protected EntityManagerInterface $manager;

    public function __construct(EntityManagerInterface $manager)
    {
        $this->manager = $manager;
    }

    /** Follow this example to extend : */

    /**
     * public function __invoke(): array
     * {
     * return $this->getFromClass(User::class, 10);
     * }.
     */
    protected function getFromClass(string $class, int $limit = 1): array
    {
        return $this->getRepository($class)->findBy([], ['id' => 'DESC'], $limit);
    }

    protected function getRepository(string $class): ObjectRepository
    {
        return $this->manager->getRepository($class);
    }
}
