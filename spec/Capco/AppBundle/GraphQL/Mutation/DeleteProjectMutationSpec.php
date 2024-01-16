<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Mutation\DeleteProjectMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteProjectMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer
    ) {
        $this->beConstructedWith($em, $globalIdResolver, $authorizationChecker, $indexer);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteProjectMutation::class);
    }

    public function it_should_delete_project(
        Arg $arguments,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Project $project
    ) {
        $id = 'abc';
        $this->getMockedGraphQLArgumentFormatted($arguments);
        $arguments->offsetGet('id')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($project);

        $em->remove(Argument::type(Project::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldReturn([
            'deletedProjectId' => $id,
        ]);
    }

    public function it_should_not_grant_access_if_no_project_found(
        User $viewer,
        GlobalIdResolver $globalIdResolver
    ) {
        $projectId = 'abc';
        $globalIdResolver->resolve($projectId, $viewer)->willReturn(null);

        $this->isGranted($projectId, $viewer)->shouldReturn(false);
    }

    public function it_should_call_voter_if_project_exist(
        User $viewer,
        GlobalIdResolver $globalIdResolver,
        Project $project,
        AuthorizationChecker $authorizationChecker
    ) {
        $projectId = 'abc';
        $globalIdResolver->resolve($projectId, $viewer)->willReturn($project);
        $authorizationChecker->isGranted(ProjectVoter::DELETE, $project)->shouldBeCalled();

        $this->isGranted($projectId, $viewer);
    }
}
