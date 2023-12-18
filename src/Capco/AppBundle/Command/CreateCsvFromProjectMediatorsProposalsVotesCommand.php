<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class CreateCsvFromProjectMediatorsProposalsVotesCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const PROPOSALS_HEADERS = [
        'proposal_id',
        'proposal_title',
        'proposal_reference',
        'proposal_url',
        'vote_id',
    ];

    private ConnectionTraversor $connectionTraversor;
    private Executor $executor;
    private string $projectRootDir;
    private LoggerInterface $logger;
    private Manager $toggleManager;
    private ProjectRepository $projectRepository;
    private SelectionStepRepository $selectionStepRepository;
    private ProposalUrlResolver $proposalUrlResolver;
    private RequestStack $requestStack;
    private ProposalRepository $proposalRepository;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        ExportUtils $exportUtils,
        Executor $executor,
        Manager $toggleManager,
        string $projectRootDir,
        SelectionStepRepository $selectionStepRepository,
        ProjectRepository $projectRepository,
        ProposalRepository $proposalRepository,
        LoggerInterface $logger,
        ProposalUrlResolver $proposalUrlResolver,
        RequestStack $requestStack
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->logger = $logger;
        $this->toggleManager = $toggleManager;
        $this->projectRootDir = $projectRootDir;
        $this->projectRepository = $projectRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->proposalUrlResolver = $proposalUrlResolver;
        $this->requestStack = $requestStack;
        $this->proposalRepository = $proposalRepository;
        parent::__construct($exportUtils);
    }

    public static function getFilename(string $slug): string
    {
        return self::getShortenedFilename('mediators_proposals_votes_' . $slug);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:projects-mediators-proposals-votes')->setDescription(
            'Create csv file from projects mediators proposals votes data'
        );

        $this->addArgument(
            'projectId',
            InputArgument::REQUIRED,
            'Please provide the project id where you want to export mediators proposals votes.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $delimiter = $input->getOption('delimiter');

        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return 1;
        }

        $projectId = $input->getArgument('projectId');
        /** @var Project $project */
        $project = $this->projectRepository->find(['id' => $projectId]);
        $projectMediatorsProposalsVotes = $this->selectionStepRepository->findProjectMediatorsProposalsVotes($projectId);

        $fileName = self::getFilename($project->getSlug());
        $writer = WriterFactory::create(Type::CSV, $delimiter);
        $writer->openToFile(
            sprintf('%s/public/export/%s', $this->projectRootDir, $fileName)
        );

        $writer->addRow(WriterEntityFactory::createRowFromArray(self::PROPOSALS_HEADERS));
        $progressBar = new ProgressBar($output, \count($projectMediatorsProposalsVotes));

        foreach ($projectMediatorsProposalsVotes as $projectMediatorsProposalsVote) {
            $proposal = $this->proposalRepository->find($projectMediatorsProposalsVote['proposal_id']);

            $projectMediatorsProposalsVote['proposal_url'] = $this->proposalUrlResolver->__invoke($proposal);

            $orderedArray = array_flip(self::PROPOSALS_HEADERS);
            $orderedArray['proposal_id'] = GlobalId::toGlobalId('Proposal', $projectMediatorsProposalsVote['proposal_id']);
            $orderedArray['proposal_title'] = $projectMediatorsProposalsVote['title'];
            $orderedArray['proposal_reference'] = $projectMediatorsProposalsVote['reference'];
            $orderedArray['proposal_url'] = $projectMediatorsProposalsVote['proposal_url'];
            $orderedArray['vote_id'] = $projectMediatorsProposalsVote['id'];

            $writer->addRow(WriterEntityFactory::createRowFromArray($orderedArray));
        }

        $this->executeSnapshot($input, $output, $fileName);

        $writer->close();
        $output->writeln('The export file "' . $fileName . '" has been created.');
        $progressBar->finish();

        $output->writeln('All projects mediators proposals votes have been successfully exported!');

        return 0;
    }
}
