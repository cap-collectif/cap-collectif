<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use PHPUnit\Framework\TestCase;

abstract class AuthorizationTestCase extends TestCase
{
    /** @return iterable<string, array{string}> */
    public static function organizationDeletionRoles(): iterable
    {
        yield 'ordinary member who created the resource' => [\Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType::USER];
        yield 'organization administrator who did not create the resource' => [\Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType::ADMIN];
    }

    /** @return iterable<string, array{bool}> */
    public static function unprivilegedViewers(): iterable
    {
        yield 'anonymous viewer' => [false];
        yield 'ordinary account' => [true];
    }

    protected function attachProposalToProject(Proposal $proposal, Project $project): void
    {
        $project->setVisibility(\Capco\AppBundle\Enum\ProjectVisibilityMode::VISIBILITY_PUBLIC);
        $step = (new CollectStep())->setTimeless(true);
        $link = (new ProjectAbstractStep())->setProject($project)->setStep($step);
        $step->setProjectAbstractStep($link);
        $project->addStep($link);
        $form = (new ProposalForm())->setStep($step);
        $step->setProposalForm($form);
        $proposal->setProposalForm($form);
    }

    protected function attachDebateToProject(Debate $debate, Project $project): void
    {
        $project->setVisibility(\Capco\AppBundle\Enum\ProjectVisibilityMode::VISIBILITY_PUBLIC);
        $step = (new DebateStep($debate))->setTimeless(true);
        $link = (new ProjectAbstractStep())->setProject($project)->setStep($step);
        $step->setProjectAbstractStep($link);
        $project->addStep($link);
    }
}
