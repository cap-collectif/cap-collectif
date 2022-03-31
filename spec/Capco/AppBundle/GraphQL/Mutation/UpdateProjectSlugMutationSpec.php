<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Mutation\UpdateProjectSlugMutation;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\String\AbstractUnicodeString;
use Symfony\Component\String\Slugger\SluggerInterface;

class UpdateProjectSlugMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        SluggerInterface $slugger
    ) {
        $this->beConstructedWith($em, $globalIdResolver, $slugger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateProjectSlugMutation::class);
    }

    public function it_should_update_slug(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        User $viewer,
        Project $project,
        SluggerInterface $slugger,
        AbstractUnicodeString $abstractUnicodeString
    ) {
        $projectId = 'projectId';
        $input
            ->offsetGet('projectId')
            ->shouldBeCalledOnce()
            ->willReturn($projectId);

        $globalIdResolver
            ->resolve($projectId, $viewer)
            ->shouldBeCalledOnce()
            ->willReturn($project);

        $rawSlug = 'my new slug';
        $input->offsetGet('slug')->willReturn($rawSlug);
        $slug = 'my-new-slug';

        $slugger
            ->slug($rawSlug)
            ->shouldBeCalledOnce()
            ->willReturn($abstractUnicodeString);
        $abstractUnicodeString
            ->toString()
            ->shouldBeCalledOnce()
            ->willReturn($slug);

        $project->setSlug($slug)->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['project']->shouldHaveType(Project::class);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_project_not_found_error_code(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        User $viewer
    ) {
        $projectId = 'not_found';
        $input
            ->offsetGet('projectId')
            ->shouldBeCalledOnce()
            ->willReturn($projectId);

        $globalIdResolver
            ->resolve($projectId, $viewer)
            ->shouldBeCalledOnce()
            ->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['project']->shouldBe(null);
        $payload['errorCode']->shouldBe(UpdateProjectSlugMutation::PROJECT_NOT_FOUND);
    }
}
