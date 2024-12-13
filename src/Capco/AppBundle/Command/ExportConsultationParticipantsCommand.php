<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\ConsultationParticipantExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportConsultationParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const STEP_FOLDER = 'consultation/';
    protected string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private Manager $toggleManager,
        private ConsultationStepRepository $consultationRepository,
        string $projectRootDir,
        private ConsultationParticipantExporter $exporter,
        private ParticipantsFilePathResolver $participantsFilePathResolver,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $count = $this->consultationRepository->count([]);

        if (0 === $count) {
            $style->error('No consultation step found');

            return 0;
        }

        $style->writeln(sprintf('Found %d consultations steps', $count));

        $style->note('Starting the export.');
        $style->progressStart($count);
        $offset = 0;
        $batchSize = ConsultationParticipantExporter::BATCH_SIZE;

        do {
            $consultationSteps = $this->consultationRepository
                ->getPaginator($batchSize, $offset)
                ->getQuery()
                ->getResult()
            ;

            /** @var ConsultationStep $consultationStep */
            foreach ($consultationSteps as $consultationStep) {
                $this->exporter->initializeStyle($style);
                $participantsIds = $this->userRepository->getParticipantsIdsConfirmedForAConsultation($consultationStep);
                if ([] === $participantsIds) {
                    $style->progressAdvance();

                    continue;
                }

                $paths['simplified'] = $this->participantsFilePathResolver->getSimplifiedExportPath($consultationStep);
                $paths['full'] = $this->participantsFilePathResolver->getFullExportPath($consultationStep);

                $this->exporter->exportConsultationParticipants(
                    $participantsIds,
                    $paths,
                    $input->getOption('delimiter')
                );

                $style->progressAdvance();

                $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($consultationStep, true));
                $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($consultationStep));
            }
            $this->entityManager->clear();

            $offset += $batchSize;
        } while (\count($consultationSteps) > 0);

        $style->progressFinish();

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName('capco:export:consultation:participants')
            ->setDescription('Export consultation participants')
        ;
    }
}
