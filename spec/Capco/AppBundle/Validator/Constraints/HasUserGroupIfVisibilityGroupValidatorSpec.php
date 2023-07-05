<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Validator\Constraints\HasUserGroupIdVisibilityGroup;
use Capco\AppBundle\Validator\Constraints\HasUserGroupIfVisibilityGroupValidator;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasUserGroupIfVisibilityGroupValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(HasUserGroupIfVisibilityGroupValidator::class);
    }

    public function it_should_be_correct_if_project_has_custom_visibility_and_group(
        Project $project,
        HasUserGroupIdVisibilityGroup $constraint,
        ExecutionContextInterface $context
    ) {
        $project
            ->getVisibility()
            ->willReturn(ProjectVisibilityMode::VISIBILITY_CUSTOM)
            ->shouldBeCalled()
        ;
        $group1 = new Group();
        $group1
            ->setTitle('group1')
            ->setDescription('group1')
            ->setSlug('group-1')
        ;
        $group2 = new Group();
        $group2
            ->setTitle('group2')
            ->setDescription('group2')
            ->setSlug('group-2')
        ;
        $project
            ->getRestrictedViewerGroups()
            ->willReturn(new ArrayCollection([$group1, $group2]))
            ->shouldBeCalled()
        ;

        $context->addViolation($constraint->noGroupMessage, [])->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate($project, $constraint);
    }

    public function it_should_add_violation_if_project_has_custom_visibility_and_no_group(
        Project $project,
        HasUserGroupIdVisibilityGroup $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $project
            ->getVisibility()
            ->willReturn(ProjectVisibilityMode::VISIBILITY_CUSTOM)
            ->shouldBeCalled()
        ;
        $project
            ->getRestrictedViewerGroups()
            ->willReturn(new ArrayCollection([]))
            ->shouldBeCalled()
        ;

        $this->initialize($context);

        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->noGroupMessage)
            ->willReturn($builder)
            ->shouldBeCalled()
        ;

        $this->validate($project, $constraint);
    }

    public function it_should_add_violation_if_project_has_not_custom_visibility_and_group(
        Project $project,
        HasUserGroupIdVisibilityGroup $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $project
            ->getVisibility()
            ->willReturn(ProjectVisibilityMode::VISIBILITY_ME)
            ->shouldBeCalled()
        ;
        $group1 = new Group();
        $group1
            ->setTitle('group1')
            ->setDescription('group1')
            ->setSlug('group-1')
        ;
        $group2 = new Group();
        $group2
            ->setTitle('group2')
            ->setDescription('group2')
            ->setSlug('group-2')
        ;
        $project
            ->getRestrictedViewerGroups()
            ->willReturn(new ArrayCollection([$group1, $group2]))
            ->shouldBeCalled()
        ;

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->groupButNotCustom)
            ->willReturn($builder)
            ->shouldBeCalled()
        ;
        $this->validate($project, $constraint);
    }
}
