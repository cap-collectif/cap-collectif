<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Service\ParticipationWorkflow\ProposalReconcillier;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ProposalReconcillierTest extends TestCase
{
    private ProposalReconcillier $proposalReconcillier;
    private EntityManagerInterface $em;
    private Participant $participant;
    private User $viewer;
    private Proposal $proposal;
    private CollectStep $collectStep;
    /** @var array<int, Requirement> */
    private array $requirements = [];

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->proposalReconcillier = new ProposalReconcillier($this->em);

        $this->participant = $this->createMock(Participant::class);
        $this->viewer = $this->createMock(User::class);
        $this->proposal = $this->createMock(Proposal::class);
        $proposalForm = $this->createMock(ProposalForm::class);
        $this->collectStep = $this->createMock(CollectStep::class);

        $this->participant->method('getProposals')->willReturn(new ArrayCollection([$this->proposal]));
        $this->proposal->method('getProposalForm')->willReturn($proposalForm);
        $proposalForm->method('getStep')->willReturn($this->collectStep);
        $this->collectStep->method('isClosed')->willReturn(false);
        $this->collectStep->method('getRequirements')->willReturnCallback(
            fn () => new ArrayCollection($this->requirements)
        );
    }

    public function testShouldNotReconcileProposalWhenAnonymousParticipantHasNoEmail(): void
    {
        $this->disableCompletionStatusFilter();

        $this->participant->method('getEmail')->willReturn(null);
        $this->viewer->method('getEmail')->willReturn('user@capco.com');
        $this->participant->method('isEmailConfirmed')->willReturn(false);
        $this->viewer->method('isEmailConfirmed')->willReturn(true);

        $this->proposal->expects($this->never())->method('setContributor');

        $this->proposalReconcillier->reconcile($this->participant, $this->viewer);
    }

    public function testShouldReconcileProposalWhenParticipantEmailMatchesViewerEmail(): void
    {
        $this->disableCompletionStatusFilter();

        $this->participant->method('getEmail')->willReturn('user@capco.com');
        $this->viewer->method('getEmail')->willReturn('user@capco.com');
        $this->participant->method('isEmailConfirmed')->willReturn(true);
        $this->viewer->method('isEmailConfirmed')->willReturn(true);

        $this->proposal->expects($this->once())->method('setContributor')->with($this->viewer);

        $this->proposalReconcillier->reconcile($this->participant, $this->viewer);
    }

    public function testShouldReconcileProposalWhenStepHasSsoRequirement(): void
    {
        $this->disableCompletionStatusFilter();

        $ssoRequirement = $this->createMock(Requirement::class);
        $ssoRequirement->method('getType')->willReturn(Requirement::SSO);
        $this->requirements = [$ssoRequirement];

        $this->participant->method('getEmail')->willReturn(null);
        $this->viewer->method('getEmail')->willReturn('user@capco.com');
        $this->participant->method('isEmailConfirmed')->willReturn(false);
        $this->viewer->method('isEmailConfirmed')->willReturn(true);

        $this->proposal->expects($this->once())->method('setContributor')->with($this->viewer);

        $this->proposalReconcillier->reconcile($this->participant, $this->viewer);
    }

    private function disableCompletionStatusFilter(): void
    {
        $filtersMock = $this->createMock(FilterCollection::class);
        $this->em->method('getFilters')->willReturn($filtersMock);
        $filtersMock->expects($this->once())
            ->method('isEnabled')
            ->with(ContributionCompletionStatusFilter::FILTER_NAME)
            ->willReturn(true)
        ;
        $filtersMock->expects($this->once())->method('disable')->with(ContributionCompletionStatusFilter::FILTER_NAME);
        $this->em->expects($this->once())->method('flush');
    }
}
