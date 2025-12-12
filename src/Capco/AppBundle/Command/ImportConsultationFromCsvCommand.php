<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\ConsultationRepository;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ImportConsultationFromCsvCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserManagerInterface $userManager,
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly ConsultationRepository $consultationRepository,
        private readonly OpinionRepository $opinionRepository,
        private readonly OpinionTypeRepository $opinionTypeRepository,
        private readonly ProjectRepository $projectRepository,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:import:consultation-from-csv')
            ->setDescription(
                'Import consultation from CSV file with specified author and consultation step'
            )
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'user',
                InputArgument::REQUIRED,
                'Please provide the email of the author you want to use.'
            )
            ->addArgument(
                'step',
                InputArgument::OPTIONAL,
                'Please provide the slug of the consultation step you want to use (optional - if not provided, consultation will not be tied to any step)'
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Set this option to force data import even if opinion with same title are found.'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            )
            ->addOption(
                'pinned',
                'p',
                InputOption::VALUE_NONE,
                'Set this option to pin all imported opinions.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        return $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $user = $this->validateAndGetUser($input->getArgument('user'), $output);
        if (!$user) {
            return Command::FAILURE;
        }

        $consultationStep = $this->validateAndGetConsultationStep($input->getArgument('step'), $output);

        $filePath = $input->getArgument('filePath');
        $delimiter = $input->getOption('delimiter') ?? ';';

        if (!file_exists($filePath)) {
            throw new \RuntimeException("File not found: {$filePath}");
        }

        $rows = $this->getOpinions($filePath, $delimiter);

        return $this->processOpinions($rows, $consultationStep, $user, $input, $output);
    }

    /**
     * @return \Generator<int, array<int, string>>
     */
    protected function getOpinions(string $filePath, string $delimiter): \Generator
    {
        $file = new \SplFileObject($filePath, 'r');
        $file->setFlags(
            \SplFileObject::READ_CSV
            | \SplFileObject::SKIP_EMPTY
            | \SplFileObject::READ_AHEAD
        );
        $file->setCsvControl($delimiter);

        foreach ($file as $row) {
            if (\is_array($row) && array_is_list($row) && array_reduce($row, fn ($carry, $v) => $carry && \is_string($v), initial: true)) {
                yield $row;
            }
        }
    }

    private function validateAndGetUser(string $userEmail, OutputInterface $output): ?UserInterface
    {
        $user = $this->userManager->findUserByEmail($userEmail);

        if (!$user) {
            $this->displayError($output, "Unknown user {$userEmail}. Please provide an existing user email.");
        }

        return $user;
    }

    private function validateAndGetConsultationStep(?string $stepSlug, OutputInterface $output): ?ConsultationStep
    {
        if (!$stepSlug) {
            $output->writeln('<comment>No consultation step provided. Consultations will be created without being tied to a step.</comment>');

            return null;
        }

        $consultationStep = $this->consultationStepRepository->findOneBy(['slug' => $stepSlug]);

        if (!$consultationStep) {
            $this->displayError($output, "Unknown consultation step {$stepSlug}. Please provide an existing consultation step slug.");
        }

        return $consultationStep;
    }

    /**
     * .@param \Generator<int, array<int, string>> $rows.
     */
    private function processOpinions(
        \Generator $rows,
        ?ConsultationStep $consultationStep,
        UserInterface $user,
        InputInterface $input,
        OutputInterface $output
    ): int {
        $rowsArray = iterator_to_array($rows);

        if (empty($rowsArray)) {
            return Command::SUCCESS;
        }

        $headers = $rowsArray[0];
        unset($rowsArray[0]);

        // Pre-load all data to avoid N+1 queries
        $caches = $this->preloadData($rowsArray, $consultationStep, $output);

        $defaultConsultation = $consultationStep?->getFirstConsultation();

        $progress = new ProgressBar($output, \count($rowsArray));
        $progress->start();

        $position = 1;
        $batchSize = 50;
        $processedCount = 0;

        foreach ($rowsArray as $index => $rowData) {
            if (\count($rowData) !== \count($headers)) {
                throw new \RuntimeException("Row {$index} does not match number of columns.");
            }

            $projectTitle = $this->extractProjectTitle($rowData);
            $stepTitle = $this->extractStepTitle($rowData);

            $rowConsultationStep = $consultationStep; // Default to command argument
            if ($projectTitle && $stepTitle) {
                $cacheKey = $projectTitle . '|' . $stepTitle;
                if (!isset($caches['steps'][$cacheKey])) {
                    $project = $this->getOrCreateProjectCached($projectTitle, $user, $caches['projects'], $output);
                    $caches['steps'][$cacheKey] = $this->getOrCreateConsultationStepForProjectCached($stepTitle, $project, $output);
                }
                $rowConsultationStep = $caches['steps'][$cacheKey];
            }

            $consultation = $this->determineConsultationCached($rowData, $rowConsultationStep, $defaultConsultation, $caches['consultations'], $output);
            $sectionDescription = $this->extractSectionDescription($rowData);
            $opinionType = $this->getOrCreateOpinionTypeCached($rowData[1], $consultation, $sectionDescription, $caches['opinionTypes'], $output);

            $opinion = $this->createOrUpdateOpinionCached(
                $rowData,
                $consultation,
                $opinionType,
                $user,
                $position,
                $input,
                $caches['existingOpinions'],
                $output
            );

            if (Command::FAILURE === $opinion) {
                return Command::FAILURE;
            }

            $progress->advance();
            ++$position;
            ++$processedCount;

            if (0 === $processedCount % $batchSize) {
                $this->em->flush();
            }
        }

        $this->em->flush();
        $progress->finish();

        $this->displaySuccess($output, \count($rowsArray));

        return Command::SUCCESS;
    }

    /**
     * Pre-load all data from CSV to avoid N+1 queries.
     *
     * @param array<int, array<int, string>> $rows
     *
     * @return array{projects: array<string, Project>, consultations: array<string, Consultation>, opinionTypes: array<string, OpinionType>, existingOpinions: array<string, Opinion>}
     */
    private function preloadData(
        array $rows,
        ?ConsultationStep $consultationStep,
        OutputInterface $output
    ): array {
        $output->writeln('<info>Pre-loading data to optimize performance...</info>');

        $projectTitles = [];
        $consultationTitles = [];
        $opinionTitles = [];

        foreach ($rows as $rowData) {
            if ($projectTitle = $this->extractProjectTitle($rowData)) {
                $projectTitles[$projectTitle] = true;
            }
            if ($consultationTitle = $this->extractConsultationTitle($rowData)) {
                $consultationTitles[$consultationTitle] = true;
            }
            if (isset($rowData[0])) {
                $opinionTitles[$rowData[0]] = true;
            }
        }

        $projects = [];
        if (!empty($projectTitles)) {
            $loadedProjects = $this->projectRepository->findBy(['title' => array_keys($projectTitles)]);
            foreach ($loadedProjects as $project) {
                \assert($project instanceof Project);
                $title = $project->getTitle();
                \assert(\is_string($title));
                $projects[$title] = $project;
            }
        }

        /** @var array<string, Consultation> $consultations */
        $consultations = [];
        if (!empty($consultationTitles)) {
            $criteria = ['title' => array_keys($consultationTitles)];
            if ($consultationStep) {
                $criteria['step'] = $consultationStep;
            }
            $loadedConsultations = $this->consultationRepository->findBy($criteria);
            foreach ($loadedConsultations as $consultation) {
                \assert($consultation instanceof Consultation);
                $key = $consultation->getTitle() . '|' . ($consultation->getStep()?->getId() ?? 'null');
                $consultations[$key] = $consultation;
            }
        }

        /** @var array<string, OpinionType> $opinionTypes */
        $opinionTypes = [];
        if ($consultationStep) {
            $allConsultations = $consultationStep->getConsultations();
            foreach ($allConsultations as $consultation) {
                $types = $this->opinionTypeRepository->findBy(['consultation' => $consultation]);
                foreach ($types as $type) {
                    \assert($type instanceof OpinionType);
                    $key = $this->getOpinionTypeCacheKey($type->getTitle(), $consultation, $type->getParent());
                    $opinionTypes[$key] = $type;
                }
            }
        }

        /** @var array<string, Opinion> $existingOpinions */
        $existingOpinions = [];
        if ($consultationStep && !empty($opinionTitles)) {
            $allConsultations = $consultationStep->getConsultations()->toArray();
            $opinions = $this->opinionRepository->findBy([
                'consultation' => $allConsultations,
                'title' => array_keys($opinionTitles),
            ]);
            foreach ($opinions as $opinion) {
                \assert($opinion instanceof Opinion);
                $key = $opinion->getTitle() . '|' . $opinion->getConsultation()->getId();
                $existingOpinions[$key] = $opinion;
            }
        }

        $output->writeln(sprintf(
            '<info>Loaded: %d projects, %d consultations, %d opinion types, %d existing opinions</info>',
            \count($projects),
            \count($consultations),
            \count($opinionTypes),
            \count($existingOpinions)
        ));

        return [
            'projects' => $projects,
            'consultations' => $consultations,
            'opinionTypes' => $opinionTypes,
            'existingOpinions' => $existingOpinions,
        ];
    }

    private function getOpinionTypeCacheKey(string $title, Consultation $consultation, ?OpinionType $parent): string
    {
        return $title . '|' . $consultation->getId() . '|' . ($parent?->getId() ?? 'null');
    }

    /**
     * @param array<string, Project> $projectsCache
     */
    private function getOrCreateProjectCached(
        string $title,
        UserInterface $user,
        array &$projectsCache,
        OutputInterface $output
    ): Project {
        if (isset($projectsCache[$title])) {
            return $projectsCache[$title];
        }

        $output->writeln("<info>Creating new project: {$title}</info>");
        $project = new Project();
        $project->setTitle($title);
        $project->setOwner($user);

        $this->em->persist($project);

        $projectsCache[$title] = $project;

        return $project;
    }

    private function getOrCreateConsultationStepForProjectCached(
        string $title,
        Project $project,
        OutputInterface $output
    ): ConsultationStep {
        $existingSteps = $project->getSteps();
        foreach ($existingSteps as $projectAbstractStep) {
            $step = $projectAbstractStep->getStep();
            if ($step instanceof ConsultationStep && $step->getTitle() === $title) {
                return $step;
            }
        }

        $output->writeln("<info>Creating new consultation step: {$title} for project: {$project->getTitle()}</info>");

        // Calculate position: get the max position + 1
        $maxPosition = 0;
        foreach ($project->getSteps() as $projectAbstractStep) {
            $position = $projectAbstractStep->getPosition();
            if ($position > $maxPosition) {
                $maxPosition = $position;
            }
        }

        $consultationStep = new ConsultationStep();
        $consultationStep->setTitle($title);
        $consultationStep->setLabel($title);
        $consultationStep->setIsEnabled(true);
        $consultationStep->setTimeless(true);

        $projectAbstractStep = new ProjectAbstractStep();
        $projectAbstractStep->setProject($project);
        $projectAbstractStep->setStep($consultationStep);
        $projectAbstractStep->setPosition($maxPosition + 1);

        $this->em->persist($consultationStep);
        $this->em->persist($projectAbstractStep);

        return $consultationStep;
    }

    /**
     * @param array<int, mixed>           $rowData
     * @param array<string, Consultation> $consultationsCache
     */
    private function determineConsultationCached(
        array $rowData,
        ?ConsultationStep $consultationStep,
        ?Consultation $defaultConsultation,
        array &$consultationsCache,
        OutputInterface $output
    ): Consultation {
        $consultationTitle = $this->extractConsultationTitle($rowData);

        if ($consultationTitle) {
            return $this->getOrCreateConsultationCached($consultationTitle, $consultationStep, $consultationsCache, $output);
        }

        if ($defaultConsultation) {
            return $defaultConsultation;
        }

        $defaultTitle = $consultationStep
            ? "Default Consultation for {$consultationStep->getTitle()}"
            : 'Default Consultation';

        $output->writeln("<comment>No consultation specified. Creating: {$defaultTitle}</comment>");

        return $this->getOrCreateConsultationCached($defaultTitle, $consultationStep, $consultationsCache, $output);
    }

    /**
     * @param array<string, Consultation> $consultationsCache
     */
    private function getOrCreateConsultationCached(
        string $title,
        ?ConsultationStep $consultationStep,
        array &$consultationsCache,
        OutputInterface $output
    ): Consultation {
        $cacheKey = $title . '|' . ($consultationStep?->getId() ?? 'null');

        if (isset($consultationsCache[$cacheKey])) {
            return $consultationsCache[$cacheKey];
        }

        $stepInfo = $consultationStep ? " (tied to step: {$consultationStep->getTitle()})" : ' (not tied to any step)';
        $output->writeln("<info>Creating new consultation: {$title}{$stepInfo}</info>");

        $consultation = new Consultation();
        $consultation->setTitle($title);
        if ($consultationStep) {
            $consultation->setStep($consultationStep);
        }

        $this->em->persist($consultation);

        $consultationsCache[$cacheKey] = $consultation;

        return $consultation;
    }

    /**
     * @param array<string, OpinionType> $opinionTypesCache
     */
    private function getOrCreateOpinionTypeCached(
        string $path,
        Consultation $consultation,
        ?string $sectionDescription,
        array &$opinionTypesCache,
        OutputInterface $output
    ): OpinionType {
        $pathParts = array_map('trim', explode('|', $path));
        $parentOpinionType = null;

        foreach ($pathParts as $index => $title) {
            $isRootLevel = 0 === $index;
            $cacheKey = $this->getOpinionTypeCacheKey($title, $consultation, $parentOpinionType);

            $opinionType = $opinionTypesCache[$cacheKey] ?? null;

            if (!$opinionType) {
                $opinionType = $this->findOpinionType($title, $consultation, $parentOpinionType, $isRootLevel);
            }

            if (!$opinionType) {
                $opinionType = $this->createOpinionTypeCached($title, $consultation, $parentOpinionType, $index + 1, $output);
                $opinionTypesCache[$cacheKey] = $opinionType;
            } elseif ($this->shouldDisableAsParent($opinionType, $parentOpinionType)) {
                $this->disableOpinionTypeCached($opinionType, $output);
            }

            // Set description on the first (root) opinion type if provided
            if (0 === $index && null !== $sectionDescription && $opinionType->getDescription() !== $sectionDescription) {
                $output->writeln("<info>Setting description for section: {$title}</info>");
                $opinionType->setDescription($sectionDescription);
                $this->em->persist($opinionType);
            }

            $parentOpinionType = $opinionType;
        }

        return $parentOpinionType;
    }

    private function createOpinionTypeCached(
        string $title,
        Consultation $consultation,
        ?OpinionType $parent,
        int $position,
        OutputInterface $output
    ): OpinionType {
        $parentInfo = $parent ? " (child of {$parent->getTitle()})" : '';
        $output->writeln("<info>Creating opinion type: {$title}{$parentInfo}</info>");

        $opinionType = new OpinionType();
        $opinionType->setTitle($title);
        $opinionType->setConsultation($consultation);
        $opinionType->setPosition($position);
        $opinionType->setColor('blue');
        $opinionType->setDefaultFilter('votes');
        $opinionType->setIsEnabled(true);

        if ($parent) {
            $opinionType->setParent($parent);
            $this->disableParentIfEnabledCached($parent, $output);
        }

        $this->em->persist($opinionType);

        return $opinionType;
    }

    private function disableParentIfEnabledCached(OpinionType $parent, OutputInterface $output): void
    {
        if ($parent->getIsEnabled()) {
            $this->disableOpinionTypeCached($parent, $output);
        }
    }

    private function disableOpinionTypeCached(OpinionType $opinionType, OutputInterface $output): void
    {
        $output->writeln("<comment>Disabling: {$opinionType->getTitle()} (has children)</comment>");
        $opinionType->setIsEnabled(false);
        $this->em->persist($opinionType);
        // Don't flush here - batch flush will handle it
    }

    /**
     * @param array<int, mixed>      $rowData
     * @param array<string, Opinion> $existingOpinionsCache
     */
    private function createOrUpdateOpinionCached(
        array $rowData,
        Consultation $consultation,
        OpinionType $opinionType,
        UserInterface $user,
        int $position,
        InputInterface $input,
        array &$existingOpinionsCache,
        OutputInterface $output
    ): int {
        $opinionTitle = $rowData[0];
        $opinionBody = $rowData[2];

        $cacheKey = $opinionTitle . '|' . $consultation->getId();
        $existingOpinion = $existingOpinionsCache[$cacheKey] ?? null;

        if ($existingOpinion instanceof Opinion && !$input->getOption('force')) {
            $this->displayError(
                $output,
                "Opinion \"{$opinionTitle}\" already exists. Use --force to overwrite."
            );

            return Command::FAILURE;
        }

        $opinion = $existingOpinion instanceof Opinion ? $existingOpinion : new Opinion();
        $opinion->setTitle($opinionTitle);
        $opinion->setBody($opinionBody);
        $opinion->setConsultation($consultation);
        $opinion->setOpinionType($opinionType);
        $opinion->setAuthor($user);
        $opinion->setPosition($position);
        $opinion->setPublishedAt(new \DateTime());

        if ($input->getOption('pinned')) {
            $opinion->setPinned(true);
        }

        $this->em->persist($opinion);

        // Update cache with the opinion
        $existingOpinionsCache[$cacheKey] = $opinion;

        return Command::SUCCESS;
    }

    /**
     * @param array<int, mixed> $rowData
     */
    private function extractConsultationTitle(array $rowData): ?string
    {
        if (!isset($rowData[3])) {
            return null;
        }

        $title = trim((string) $rowData[3]);

        return '' !== $title ? $title : null;
    }

    /**
     * @param array<int, mixed> $rowData
     */
    private function extractSectionDescription(array $rowData): ?string
    {
        if (!isset($rowData[4])) {
            return null;
        }

        $description = trim((string) $rowData[4]);

        return '' !== $description ? $description : null;
    }

    /**
     * @param array<int, mixed> $rowData
     */
    private function extractProjectTitle(array $rowData): ?string
    {
        if (!isset($rowData[5])) {
            return null;
        }

        $title = trim((string) $rowData[5]);

        return '' !== $title ? $title : null;
    }

    /**
     * @param array<int, mixed> $rowData
     */
    private function extractStepTitle(array $rowData): ?string
    {
        if (!isset($rowData[6])) {
            return null;
        }

        $title = trim((string) $rowData[6]);

        return '' !== $title ? $title : null;
    }

    private function displayError(OutputInterface $output, string $message): void
    {
        $output->writeln("<error>{$message}</error>");
        $output->writeln('<error>Import cancelled. No opinion created.</error>');
    }

    private function displaySuccess(OutputInterface $output, int $count): void
    {
        $output->writeln('');
        $output->writeln("<info>{$count} opinions successfully created.</info>");
    }

    private function findOpinionType(
        string $title,
        Consultation $consultation,
        ?OpinionType $parent,
        bool $isRootLevel
    ): ?OpinionType {
        return match ($isRootLevel) {
            true => $this->opinionTypeRepository->findOneBy([
                'title' => $title,
                'parent' => null,
                'consultation' => $consultation,
            ]),
            false => $this->opinionTypeRepository->findOneBy([
                'title' => $title,
                'parent' => $parent,
            ]),
        };
    }

    private function shouldDisableAsParent(?OpinionType $opinionType, ?OpinionType $parent): bool
    {
        return null !== $parent && true === $opinionType?->getIsEnabled();
    }
}
