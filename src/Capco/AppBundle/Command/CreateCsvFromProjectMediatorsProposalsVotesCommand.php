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
use Capco\AppBundle\Utils\Map;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;

class CreateCsvFromProjectMediatorsProposalsVotesCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private readonly ConnectionTraversor $connectionTraversor;
    private readonly Executor $executor;
    private readonly string $projectRootDir;
    private readonly LoggerInterface $logger;
    private readonly Manager $toggleManager;
    private readonly ProjectRepository $projectRepository;
    private readonly SelectionStepRepository $selectionStepRepository;
    private readonly ProposalUrlResolver $proposalUrlResolver;
    private readonly RequestStack $requestStack;
    private readonly ProposalRepository $proposalRepository;
    private readonly TranslatorInterface $translator;
    private readonly Map $map;

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
        RequestStack $requestStack,
        TranslatorInterface $translator,
        Map $map
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
        $this->translator = $translator;
        $this->map = $map;
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

        list('keys' => $headerKeys, 'translations' => $headerTranslations) = $this->getHeaders();
        $writer->addRow(WriterEntityFactory::createRowFromArray($headerTranslations));
        $progressBar = new ProgressBar($output, \count($projectMediatorsProposalsVotes));

        foreach ($projectMediatorsProposalsVotes as $projectMediatorsProposalsVote) {
            $proposal = $this->proposalRepository->find($projectMediatorsProposalsVote['proposal_id']);

            $projectMediatorsProposalsVote['proposal_url'] = $this->proposalUrlResolver->__invoke($proposal);

            $orderedArray = array_flip($headerKeys);
            $orderedArray['proposal_id'] = GlobalId::toGlobalId('Proposal', $projectMediatorsProposalsVote['proposal_id']);
            $orderedArray['proposal_title'] = $projectMediatorsProposalsVote['title'];
            $orderedArray['proposal_reference'] = $projectMediatorsProposalsVote['reference'];
            $orderedArray['proposal_url'] = $projectMediatorsProposalsVote['proposal_url'];
            $orderedArray['vote_id'] = $projectMediatorsProposalsVote['vote_id'];
            $orderedArray['vote_date'] = $projectMediatorsProposalsVote['created_at'];
            $orderedArray['vote_ranking'] = $projectMediatorsProposalsVote['position'];
            $orderedArray['vote_validation'] = 1 == $projectMediatorsProposalsVote['is_accounted'] ? $this->translator->trans('global.yes') : $this->translator->trans('global.no');
            $orderedArray['voter_id'] = $projectMediatorsProposalsVote['participant_id'];
            $orderedArray['voter_lastname'] = $projectMediatorsProposalsVote['lastname'];
            $orderedArray['voter_firstname'] = $projectMediatorsProposalsVote['firstname'];
            $orderedArray['voter_date_of_birth'] = $projectMediatorsProposalsVote['date_of_birth'];
            $orderedArray['voter_address'] = $this->map->getReadableAddress($projectMediatorsProposalsVote['postal_address']);
            $orderedArray['voter_email'] = $projectMediatorsProposalsVote['email'];
            $orderedArray['voter_phone'] = $projectMediatorsProposalsVote['phone'];
            $orderedArray['mediator_id'] = $projectMediatorsProposalsVote['mediator_id'];
            $orderedArray['mediator_username'] = $projectMediatorsProposalsVote['username'];

            $writer->addRow(WriterEntityFactory::createRowFromArray($orderedArray));
        }

        $this->executeSnapshot($input, $output, $fileName);

        $writer->close();
        $output->writeln('The export file "' . $fileName . '" has been created.');
        $progressBar->finish();

        $output->writeln('All projects mediators proposals votes have been successfully exported!');

        return 0;
    }

    private function getHeaders(): array
    {
        $headers = [
            'proposal_id' => $this->translator->trans('export_proposal_id'),
            'proposal_reference' => $this->translator->trans('export_proposal_reference'),
            'proposal_title' => $this->translator->trans('export_proposal_title'),
            'proposal_url' => $this->translator->trans('export_proposal_url'),
            'vote_id' => $this->translator->trans('export_vote_id'),
            'vote_date' => $this->translator->trans('export_vote_date'),
            'vote_ranking' => $this->translator->trans('export_vote_ranking'),
            'vote_validation' => $this->translator->trans('export_vote_validation'),
            'voter_id' => $this->translator->trans('export_voter_id'),
            'voter_lastname' => $this->translator->trans('export_voter_lastname'),
            'voter_firstname' => $this->translator->trans('export_voter_firstname'),
            'voter_date_of_birth' => $this->translator->trans('export_voter_date_of_birth'),
            'voter_address' => $this->translator->trans('export_voter_address'),
            'voter_email' => $this->translator->trans('export_voter_email'),
            'voter_phone' => $this->translator->trans('export_voter_phone'),
            'mediator_id' => $this->translator->trans('export_mediator_id'),
            'mediator_username' => $this->translator->trans('export_mediator_username'),
        ];

        return [
            'keys' => array_keys($headers),
            'translations' => array_values($headers),
        ];
    }
}
