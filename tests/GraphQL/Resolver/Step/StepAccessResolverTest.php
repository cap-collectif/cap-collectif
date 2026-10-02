<?php

namespace CapcoTests\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepAccessResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @covers \Capco\AppBundle\GraphQL\Resolver\Step\StepAccessResolver
 */
class StepAccessResolverTest extends TestCase
{
    public function testCanEditDelegatesToProjectPermission(): void
    {
        $project = $this->createMock(Project::class);
        $step = $this->createMock(AbstractStep::class);
        $step->method('getProject')->willReturn($project);
        $viewer = $this->createMock(User::class);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->once())->method('isGranted')->with(ProjectVoter::EDIT, $project)->willReturn(true);

        $resolver = new StepAccessResolver(
            $authorizationChecker,
            $this->createMock(HubDocumentsStepGuard::class)
        );

        self::assertTrue($resolver->canEdit($step, $viewer));
    }

    public function testCanDeleteRejectsProtectedSteps(): void
    {
        $step = $this->createMock(AbstractStep::class);
        $viewer = $this->createMock(User::class);
        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->expects($this->once())->method('isProtectedDocumentsStep')->with($step)->willReturn(true);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->never())->method('isGranted');

        $resolver = new StepAccessResolver($authorizationChecker, $hubDocumentsStepGuard);

        self::assertFalse($resolver->canDelete($step, $viewer));
    }

    public function testCanDeleteDelegatesToProjectPermission(): void
    {
        $project = $this->createMock(Project::class);
        $step = $this->createMock(AbstractStep::class);
        $step->method('getProject')->willReturn($project);
        $viewer = $this->createMock(User::class);
        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->method('isProtectedDocumentsStep')->willReturn(false);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->once())->method('isGranted')->with(ProjectVoter::DELETE, $project)->willReturn(true);

        $resolver = new StepAccessResolver($authorizationChecker, $hubDocumentsStepGuard);

        self::assertTrue($resolver->canDelete($step, $viewer));
    }

    public function testCanDeleteRejectsWhenProjectPermissionIsDenied(): void
    {
        $project = $this->createMock(Project::class);
        $step = $this->createMock(AbstractStep::class);
        $step->method('getProject')->willReturn($project);
        $viewer = $this->createMock(User::class);
        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->method('isProtectedDocumentsStep')->willReturn(false);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->once())->method('isGranted')->with(ProjectVoter::DELETE, $project)->willReturn(false);

        $resolver = new StepAccessResolver($authorizationChecker, $hubDocumentsStepGuard);

        self::assertFalse($resolver->canDelete($step, $viewer));
    }

    public function testCanDeleteRejectsCollectStepWithSelectionStepForNonSuperAdmin(): void
    {
        $selectionStep = $this->createMock(SelectionStep::class);
        $project = $this->createMock(Project::class);
        $project->method('getRealSteps')->willReturn([$selectionStep]);
        $step = $this->createMock(CollectStep::class);
        $step->method('getProject')->willReturn($project);
        $viewer = $this->createMock(User::class);
        $viewer->method('isSuperAdmin')->willReturn(false);
        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->method('isProtectedDocumentsStep')->willReturn(false);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->never())->method('isGranted');

        $resolver = new StepAccessResolver($authorizationChecker, $hubDocumentsStepGuard);

        self::assertFalse($resolver->canDelete($step, $viewer));
    }

    public function testCanDeleteAllowsCollectStepWithSelectionStepForSuperAdmin(): void
    {
        $selectionStep = $this->createMock(SelectionStep::class);
        $project = $this->createMock(Project::class);
        $project->method('getRealSteps')->willReturn([$selectionStep]);
        $step = $this->createMock(CollectStep::class);
        $step->method('getProject')->willReturn($project);
        $viewer = $this->createMock(User::class);
        $viewer->method('isSuperAdmin')->willReturn(true);
        $hubDocumentsStepGuard = $this->createMock(HubDocumentsStepGuard::class);
        $hubDocumentsStepGuard->method('isProtectedDocumentsStep')->willReturn(false);

        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->expects($this->once())->method('isGranted')->with(ProjectVoter::DELETE, $project)->willReturn(true);

        $resolver = new StepAccessResolver($authorizationChecker, $hubDocumentsStepGuard);

        self::assertTrue($resolver->canDelete($step, $viewer));
    }
}
