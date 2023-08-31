<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalArchiveLimitDateResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ArchiveProposalsCommand extends Command
{
    private ProposalRepository $proposalRepository;
    private CollectStepRepository $collectStepRepository;
    private SelectionStepRepository $selectionStepRepository;
    private EntityManagerInterface $em;
    private ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepository,
        CollectStepRepository $collectStepRepository,
        SelectionStepRepository $selectionStepRepository,
        ProposalArchiveLimitDateResolver $proposalArchiveLimitDateResolver,
        Indexer $indexer
    ) {
        parent::__construct();
        $this->proposalRepository = $proposalRepository;
        $this->collectStepRepository = $collectStepRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->em = $em;
        $this->proposalArchiveLimitDateResolver = $proposalArchiveLimitDateResolver;
        $this->indexer = $indexer;
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $collectSteps = $this->collectStepRepository->findProposalArchivableSteps();
        $selectionSteps = $this->selectionStepRepository->findProposalArchivableSteps();
        $steps = array_merge($collectSteps, $selectionSteps);

        $now = new \DateTime();

        /** * @var AbstractStep[] $steps  */
        foreach ($steps as $step) {
            $voteThreshold = $step->getVoteThreshold();
            $proposals = $this->proposalRepository->findArchivableByStep($step, $voteThreshold);

            $count = 0;
            /** * @var Proposal $proposal  */
            foreach ($proposals as $proposal) {
                $dateLimit = $this->getProposalArchivedDateLimit($proposal);
                if ($dateLimit < $now) {
                    ++$count;
                    $proposal->setIsArchived(true);
                    $this->indexer->index(Proposal::class, $proposal->getId());
                }
            }

            $this->indexer->finishBulk();

            $output->writeln("Archiving {$count} proposals for step : {$step->getTitle()}");
            $this->em->flush();
        }

        return 0;
    }

    protected function configure()
    {
        $this->setName('capco:archiving-proposals');
        $this->setDescription('Archiving proposals that did not reach enough votes after a configured limit date.');
    }

    private function getProposalArchivedDateLimit(Proposal $proposal): \DateTime
    {
        return $this->proposalArchiveLimitDateResolver->__invoke($proposal);
    }
}
