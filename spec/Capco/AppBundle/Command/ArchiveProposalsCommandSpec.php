<?php

namespace spec\Capco\AppBundle\Command;

use Capco\AppBundle\Command\ArchiveProposalsCommand;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalArchiveLimitDateResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ArchiveProposalsCommandSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepository,
        CollectStepRepository $collectStepRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $proposalRepository,
            $collectStepRepository,
            $selectionStepRepository,
            $proposalArchiveLimitDateResolver,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ArchiveProposalsCommand::class);
    }

    public function it_should_archive_proposal(
        InputInterface $input,
        OutputInterface $output,
        EntityManagerInterface $em,
        CollectStepRepository $collectStepRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalRepository $proposalRepository,
        ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver,
        CollectStep $collectStep,
        Proposal $proposal,
        Indexer $indexer
    ) {
        $this->prepareData($collectStep, $collectStepRepository, $selectionStepRepository, $proposalRepository, $proposal);

        $dateLimit = new \DateTime('2023-07-01');
        $proposalArchiveLimitDateResolver->__invoke($proposal)->willReturn($dateLimit)->shouldBeCalled();
        $proposal->setIsArchived(true)
            ->shouldBeCalled()
        ;

        $proposalId = 'proposalId';
        $proposal->getId()->willReturn($proposalId);
        $indexer->index(Proposal::class, $proposalId);

        $indexer->finishBulk();

        $count = 1;

        $output->writeln("Archiving {$count} proposals for step : Step title")->shouldBeCalled();
        $em->flush()
            ->shouldBeCalled()
        ;

        $this->execute($input->getWrappedObject(), $output->getWrappedObject());
    }

    public function it_should_not_archive_proposal(
        InputInterface $input,
        OutputInterface $output,
        EntityManagerInterface $em,
        CollectStepRepository $collectStepRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalRepository $proposalRepository,
        ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver,
        CollectStep $collectStep,
        Proposal $proposal
    ) {
        $this->prepareData($collectStep, $collectStepRepository, $selectionStepRepository, $proposalRepository, $proposal);

        $dateLimit = new \DateTime('2090-07-01');
        $proposalArchiveLimitDateResolver->__invoke($proposal)->willReturn($dateLimit)->shouldBeCalled();
        $proposal->setIsArchived(true)
            ->shouldNotBeCalled()
        ;
        $count = 0;

        $output->writeln("Archiving {$count} proposals for step : Step title")->shouldBeCalled();
        $em->flush()
            ->shouldBeCalled()
        ;

        $this->execute($input->getWrappedObject(), $output->getWrappedObject());
    }

    private function prepareData(
        CollectStep $collectStep,
        CollectStepRepository $collectStepRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalRepository $proposalRepository,
        Proposal $proposal
    ): void {
        $collectStep->getTitle()->willReturn('Step title');
        $collectStepRepository->findProposalArchivableSteps()->willReturn([
            $collectStep,
        ])->shouldBeCalled();

        $selectionStepRepository->findProposalArchivableSteps()->willReturn([])->shouldBeCalled();

        $voteThreshold = 2;
        $collectStep->getVoteThreshold()->willReturn($voteThreshold)->shouldBeCalled();
        $proposalRepository->findArchivableByStep($collectStep, $voteThreshold)->willReturn([
            $proposal,
        ])->shouldBeCalled();
    }
}
