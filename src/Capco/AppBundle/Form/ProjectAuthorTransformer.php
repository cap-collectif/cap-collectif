<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\ProjectAuthorRepository;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectAuthorTransformer
{
    private $em;
    private $project;
    private $userRepository;
    private $projectAuthorRepository;

    public function __construct(
        EntityManagerInterface $em,
        UserRepository $userRepository,
        ProjectAuthorRepository $projectAuthorRepository
    ) {
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->projectAuthorRepository = $projectAuthorRepository;
    }

    public function setProject(Project $project): self
    {
        $this->project = $project;

        return $this;
    }

    public function transformUsers($usersGlobalId): array
    {
        $data = [];
        foreach ($usersGlobalId as $userId) {
            $decodedUserId = GlobalId::fromGlobalId($userId)['id'];

            if (!$decodedUserId) {
                throw new BadRequestHttpException('Sorry, please retry.');
            }

            $user = $this->userRepository->find($decodedUserId);
            if (!$user) {
                throw new BadRequestHttpException('Sorry, please retry.');
            }

            $projectAuthor = $this->projectAuthorRepository->findOneBy([
                'project' => $this->project,
                'user' => $user,
            ]);

            if (!$projectAuthor) {
                $projectAuthor = new ProjectAuthor();
                $projectAuthor->setUser($user);
                $projectAuthor->setProject($this->project);

                $this->em->persist($projectAuthor);
                $this->em->flush();

                $projectAuthor = $this->projectAuthorRepository->findOneBy([
                    'project' => $this->project,
                    'user' => $user,
                ]);
            }
            $data[] = $projectAuthor->getId();
        }

        return $data;
    }
}
