<?php

namespace Capco\AppBundle\GraphQL\DataLoader;

use Doctrine\ORM\EntityRepository;

class EntityRepositoryLinker
{
    public function __construct(
        private string $type,
        private EntityRepository $repository,
        private array $entities
    ) {
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getRepository(): EntityRepository
    {
        return $this->repository;
    }

    public function setRepository(EntityRepository $repository): self
    {
        $this->repository = $repository;

        return $this;
    }

    public function getEntities(): array
    {
        return $this->entities;
    }

    public function setEntities(array $entities): self
    {
        $this->entities = $entities;

        return $this;
    }

    public function addEntity(array $entity): void
    {
        $this->entities[] = $entity;
    }
}
