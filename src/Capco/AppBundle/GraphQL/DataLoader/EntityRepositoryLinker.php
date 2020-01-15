<?php

namespace Capco\AppBundle\GraphQL\DataLoader;

use Doctrine\ORM\EntityRepository;

class EntityRepositoryLinker
{
    /**
     * @var string
     */
    private $type;
    /**
     * @var EntityRepository
     */
    private $repository;
    /**
     * @var array
     */
    private $entities;

    public function __construct(string $type, EntityRepository $repository, array $entities)
    {
        $this->type = $type;
        $this->repository = $repository;
        $this->entities = $entities;
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
