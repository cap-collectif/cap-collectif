<?php

namespace Capco\Manager;

use Doctrine\ORM\EntityRepository;

class RepositoryManager
{
    /** @var iterable<string, EntityRepository> */
    private iterable $repositories;

    /**
     * @param iterable<EntityRepository> $repositories
     */
    public function setRepositories(iterable $repositories): void
    {
        foreach ($repositories as $repository) {
            preg_match('/\\\\(.*?)Repository/', $repository::class, $matches);

            if (!isset($matches[1])) {
                continue;
            }

            $this->repositories[$matches[1]] = $repository;
        }
    }

    public function get(string $className): ?EntityRepository
    {
        return $this->repositories[$className] ?? null;
    }
}
