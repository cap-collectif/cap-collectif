<?php
namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;

class UserProjectCountResolver
{
    private $projectRepository;
    public function __construct(ProjectRepository $projectRepository)
    {
        $this->projectRepository = $projectRepository;
    }

    public function __invoke(User $user)
    {
        $nbPublicProject = $this->projectRepository->countByUser($user);
    }
}
