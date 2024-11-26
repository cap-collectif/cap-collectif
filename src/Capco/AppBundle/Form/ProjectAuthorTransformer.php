<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProjectAuthorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectAuthorTransformer
{
    private readonly EntityManagerInterface $em;
    private ?Project $project;
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly ProjectAuthorRepository $projectAuthorRepository;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        ProjectAuthorRepository $projectAuthorRepository
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->projectAuthorRepository = $projectAuthorRepository;
    }

    public function setProject(Project $project): self
    {
        $this->project = $project;

        return $this;
    }

    public function transformUsers(array $usersGlobalId): array
    {
        $data = [];
        foreach ($usersGlobalId as $userId) {
            $author = $this->globalIdResolver->resolve($userId, null);
            if (!$author instanceof Author) {
                throw new BadRequestHttpException('Sorry, please retry.');
            }

            $projectAuthor = $this->projectAuthorRepository->findOneByUserOrOrganization(
                $this->project,
                $author
            );
            if (!$projectAuthor) {
                $projectAuthor = new ProjectAuthor();
                $projectAuthor->setAuthor($author);
                $projectAuthor->setProject($this->project);

                $this->em->persist($projectAuthor);
                $this->em->flush();
                $projectAuthor = $this->projectAuthorRepository->findOneByUserOrOrganization(
                    $this->project,
                    $author
                );
            }
            $data[] = $projectAuthor->getId();
        }

        return $data;
    }
}
