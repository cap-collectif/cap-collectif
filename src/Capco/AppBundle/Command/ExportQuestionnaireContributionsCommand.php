<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportQuestionnaireContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS = 'capco:export:questionnaire:contributions';
    private const SERIALIZER_FORMAT = 'csv';
    protected array $customFields;
    protected TranslatorInterface $translator;
    protected string $projectRootDir;
    private string $exportDirectory;
    private Manager $toggleManager;
    private ProjectDownloadResolver $projectDownloadResolver;
    private QuestionnaireRepository $questionnaireRepository;
    private Serializer $serializer;
    private LoggerInterface $logger;
    private string $delimiter;

    public function __construct(
        ExportUtils $exportUtils,
        ProjectDownloadResolver $projectDownloadResolver,
        QuestionnaireRepository $questionnaireRepository,
        Manager $manager,
        TranslatorInterface $translator,
        string $projectRootDir,
        string $exportDirectory,
        LoggerInterface $logger
    ) {
        $this->toggleManager = $manager;
        $this->projectDownloadResolver = $projectDownloadResolver;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->customFields = [];
        $this->translator = $translator;
        $this->projectRootDir = $projectRootDir;
        $this->exportDirectory = $exportDirectory;
        $this->serializer = $this->initializeSerializer();
        $this->logger = $logger;

        parent::__construct($exportUtils);
    }

    public static function getFileName(
        Questionnaire $questionnaire,
        bool $projectAdmin,
        ?bool $isSimplifiedExport = false
    ): string {
        $extension = '.csv';
        $step = $questionnaire->getStep();
        $fileName = '';

        if ($step) {
            $fileName .= ($project = $step->getProject()) ? $project->getSlug() . '_' : '';
            $fileName .= $step->getSlug();
        } else {
            $fileName = $questionnaire->getSlug();
        }

        return self::getShortenedFilename($fileName, $extension, $projectAdmin, $isSimplifiedExport);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS)
            ->setDescription(
                'Create csv file from questionnaire step. Contains only contributions from validated accounts and published responses.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $this->delimiter = $input->getOption('delimiter');

        $questionnaires = $this->questionnaireRepository->findAll();

        $updated = false;
        /**
         * @var Questionnaire $questionnaire
         */
        foreach ($questionnaires as $questionnaire) {
            $simplifiedFileName = self::getFileName($questionnaire, false, true);
            $fullFileName = self::getFileName($questionnaire, false);

            if ($this->shouldUpdateFile($simplifiedFileName, $questionnaire)
                || $this->shouldUpdateFile($fullFileName, $questionnaire)
            ) {
                $updated = true;
                $this->generateSheet($questionnaire, $simplifiedFileName, $fullFileName, $output);
                $this->executeSnapshot($input, $output, $simplifiedFileName);
                $this->executeSnapshot($input, $output, $fullFileName);
            }
        }

        if (false === $updated) {
            $style->note('No file has been updated.');
        }

        $style->success("Command '" . self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS . "' ended successfully.");

        return 0;
    }

    private function writeFiles(string $simplifiedFileName, string $fullFileName, array $simplifiedHeaders, array $fullHeaders, array $data, Filesystem $filesystem, OutputInterface $output): void
    {
        $simplifiedFilePath = $this->exportDirectory . $simplifiedFileName;
        $fullFilePath = $this->exportDirectory . $fullFileName;

        $this->createFile($filesystem, $simplifiedFilePath);
        $this->createFile($filesystem, $fullFilePath);

        $this->logExportingMessage($simplifiedFilePath, 'simplified', $output);
        $this->logExportingMessage($fullFilePath, 'full', $output);

        $this->writeHeaders($simplifiedHeaders, $filesystem, $simplifiedFilePath);
        $this->writeHeaders($fullHeaders, $filesystem, $fullFilePath);

        $simplifiedRows = $this->prepareDataRows($data, $simplifiedHeaders);
        $fullRows = $this->prepareDataRows($data, $fullHeaders);

        $this->writeDataToFile($simplifiedRows, $simplifiedFilePath, $filesystem);
        $this->writeDataToFile($fullRows, $fullFilePath, $filesystem);
    }

    /**
     * @return Exception|IOExceptionInterface
     */
    private function createFile(Filesystem $filesystem, string $simplifiedFilePath): void
    {
        try {
            $filesystem->touch($simplifiedFilePath);
        } catch (IOExceptionInterface $e) {
            echo sprintf('An error occurred while creating the file %s.', $e->getPath());
        }
    }

    private function writeHeaders(array $headers, Filesystem $filesystem, string $filePath): void
    {
        $csvHeaders = $this->serializer->encode(
            array_values([$headers]),
            self::SERIALIZER_FORMAT,
            [
                CsvEncoder::NO_HEADERS_KEY => true,
                CsvEncoder::OUTPUT_UTF8_BOM_KEY => true,
                CsvEncoder::DELIMITER_KEY => $this->delimiter,
            ]
        );
        $filesystem->dumpFile($filePath, $csvHeaders);
    }

    private function formatHeaders(array $headers): array
    {
        $formattedHeaders = [];
        foreach ($headers as $header) {
            if (\is_array($header)) {
                $formattedHeaders[] = $header['label'];
            } else {
                $formattedHeaders[] = $header;
            }
        }

        return $formattedHeaders;
    }

    private function generateSheet(
        Questionnaire $questionnaire,
        string $simplifiedFileName,
        string $fullFileName,
        OutputInterface $output,
        bool $projectAdmin = false
    ): void {
        $filesystem = new Filesystem();

        $simplifiedHeaders = $this->getFormattedHeaders($questionnaire, $projectAdmin, false);
        $fullHeaders = $this->getFormattedHeaders($questionnaire, $projectAdmin, true);

        $data = $this->getFormattedData($questionnaire, $projectAdmin);

        $this->writeFiles($simplifiedFileName, $fullFileName, $simplifiedHeaders, $fullHeaders, $data, $filesystem, $output);
    }

    private function getFormattedData(Questionnaire $questionnaire, ?bool $projectAdmin = false): array
    {
        $data = $this->projectDownloadResolver->getQuestionnaireData($questionnaire, $projectAdmin);

        foreach ($data as &$d) {
            foreach ($d as $key => $value) {
                $d[$key] = $this->exportUtils->parseCellValue(
                    $this->projectDownloadResolver->formatText($value)
                );
            }
        }

        return $data;
    }

    private function getFormattedHeaders(Questionnaire $questionnaire, bool $projectAdmin, bool $isFullExport): array
    {
        $headers = $this->projectDownloadResolver->getQuestionnaireHeaders(
            $questionnaire,
            $projectAdmin,
            $isFullExport
        );

        return $this->formatHeaders($headers);
    }

    private function initializeSerializer(): Serializer
    {
        $normalizers = [new ObjectNormalizer()];
        $encoders = [new CsvEncoder()];

        return new Serializer($normalizers, $encoders);
    }

    private function shouldUpdateFile(string $fileName, Questionnaire $questionnaire): bool
    {
        $filePath = $this->exportDirectory . $fileName;

        if (!file_exists($filePath)) {
            return true;
        }

        $dateTime = (new \DateTime())->setTimestamp(filemtime($filePath));

        try {
            return $this->questionnaireRepository->hasRecentRepliesOrUpdatedUsers($questionnaire->getId(), $dateTime);
        } catch (Exception $e) {
            $this->logger->error($e->getMessage());
        }

        return false;
    }

    private function logExportingMessage(string $filePath, string $type, OutputInterface $output): void
    {
        $output->writeln("<info>Exporting the {$type} CSV file: {$filePath}</info>");
    }

    /**
     * Prepares data rows based on the headers and whether the data is simplified.
     *
     * @param array<array<string>> $data    the full data set
     * @param array<string>        $headers the headers for the current data set
     *
     * @return array<array<string>> the prepared data rows
     */
    private function prepareDataRows(array $data, array $headers): array
    {
        $rows = [];
        foreach ($data as $rowData) {
            $row = [];
            foreach ($headers as $header) {
                $row[] = \array_key_exists($header, $rowData) ? $rowData[$header] : '';
            }
            $rows[] = $row;
        }

        return $rows;
    }

    /**
     * Encodes and writes data to a specified CSV file.
     *
     * @param array<array<string>> $rows       the data rows to write
     * @param string               $filePath   the file path where to write the data
     * @param Filesystem           $filesystem the filesystem interface to interact with the file system
     */
    private function writeDataToFile(array $rows, string $filePath, Filesystem $filesystem): void
    {
        if (!empty($rows)) {
            $csvData = $this->serializer->encode(
                $rows,
                self::SERIALIZER_FORMAT,
                [
                    CsvEncoder::NO_HEADERS_KEY => true,
                    CsvEncoder::DELIMITER_KEY => $this->delimiter,
                ]
            );
            $filesystem->appendToFile($filePath, $csvData);
        }
    }
}
