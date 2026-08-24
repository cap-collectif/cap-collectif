<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'capco:repair:idf-proposals-from-csv',
    description: 'Restore IDF proposal content from the historical CSV export.'
)]
class RepairIDFProposalsFromCsvCommand extends Command
{
    private const BATCH_SIZE = 50;
    private const ALLOWED_PROPOSAL_FORM_REFERENCES = [2, 3, 7, 11, 15, 16, 18];
    private const DISTRICT_NAMES_BY_DEPARTMENT = [
        '75' => 'Paris (75)',
        '77' => 'Seine-et-Marne (77)',
        '78' => 'Yvelines (78)',
        '91' => 'Essonne (91)',
        '92' => 'Hauts-de-Seine (92)',
        '93' => 'Seine-Saint-Denis (93)',
        '94' => 'Val-de-Marne (94)',
        '95' => "Val-d'Oise (95)",
    ];
    private const IMPACT_ZONE_CHOICE_LABELS = [
        'Quartier',
        'Communal',
        'Intercommunal',
        'Départemental',
        'Régional',
    ];
    private const IMPACT_ZONE_CONFIG_BY_FORM_REFERENCE = [
        2 => ['questionTitle' => 'Zone d’impact'],
        11 => [
            'questionTitle' => 'Zone d’impact du projet',
            'choiceLabels' => self::IMPACT_ZONE_CHOICE_LABELS,
        ],
        15 => [
            'questionTitle' => 'Zone d’impact du projet',
            'choiceLabels' => self::IMPACT_ZONE_CHOICE_LABELS,
        ],
        16 => [
            'questionTitle' => "Zone d'impact du projet",
            'choiceLabels' => self::IMPACT_ZONE_CHOICE_LABELS,
        ],
        18 => [
            'questionTitle' => "Zone d'impact du projet",
            'choiceLabels' => self::IMPACT_ZONE_CHOICE_LABELS,
        ],
    ];
    private const PROJECT_TYPE_CONFIG_BY_FORM_REFERENCE = [
        2 => [
            'questionTitle' => 'Je souhaite...',
            'labels' => [
                'Projet local' => 'Déposer un Projet Local',
                'Grand projet' => 'Renseigner la présentation de mon Grand Projet',
            ],
        ],
        3 => [
            'questionTitle' => 'Je souhaite...',
            'labels' => [
                'Projet local' => 'Déposer un Projet Local',
                'Grand projet' => 'Renseigner la présentation de mon Grand Projet',
            ],
        ],
        7 => [
            'questionTitle' => 'Téléservice',
            'labels' => [
                'Projet local' => 'Projet local',
                'Grand projet' => 'Grand projet',
            ],
        ],
        11 => [
            'questionTitle' => 'Téléservice',
            'labels' => [
                'Projet local' => 'Projet local',
                'Grand projet' => 'Grand projet',
            ],
        ],
        15 => [
            'questionTitle' => 'Téléservice',
            'labels' => [
                'Projet local' => 'Projet local',
                'Grand projet' => 'Grand projet',
            ],
        ],
        16 => [
            'questionTitle' => 'Téléservice',
            'labels' => [
                'Projet local' => 'Projet local',
                'Grand projet' => 'Grand projet',
            ],
        ],
        18 => [
            'questionTitle' => 'Téléservice',
            'labels' => [
                'Projet local' => 'Projet local',
                'Grand projet' => 'Grand projet',
            ],
        ],
    ];
    private const PROJECT_OWNER_CONFIG_BY_FORM_REFERENCE = [
        2 => [
            'grandProjectQuestionTitle' => 'Grand projet / Raison sociale du porteur de projet',
            'localAssociationQuestionTitles' => [
                'Association avec numéro SIRET / Raison sociale',
                'Association sans SIRET avec RNA / Raison sociale',
                'Association sans SIRET sans RNA / Raison sociale',
            ],
            'localProjectQuestionTitlesByStructure' => [
                'Association' => 'Association sans SIRET sans RNA / Raison sociale',
                'Entreprise' => 'Entreprise ou autre orga / Raison sociale',
                'Autre organisme privé' => 'Entreprise ou autre orga / Raison sociale',
                'Organisme public' => 'Organisme public / Raison sociale',
            ],
        ],
        3 => [
            'grandProjectQuestionTitle' => 'Grand projet / Raison sociale du porteur de projet',
            'localAssociationQuestionTitles' => [
                'Association avec numéro SIRET / Raison sociale',
                'Association sans SIRET avec RNA / Raison sociale',
                'Association sans SIRET sans RNA / Raison sociale',
            ],
            'localProjectQuestionTitlesByStructure' => [
                'Association' => 'Association sans SIRET sans RNA / Raison sociale',
                'Entreprise' => 'Entreprise ou autre orga / Raison sociale',
                'Autre organisme privé' => 'Entreprise ou autre orga / Raison sociale',
                'Organisme public' => 'Organisme public / Raison sociale',
            ],
        ],
        7 => ['questionTitle' => 'Nom de votre structure'],
        11 => ['questionTitle' => 'Nom de votre structure'],
        15 => ['questionTitle' => 'Nom de votre structure'],
        16 => ['questionTitle' => 'Nom de votre structure'],
        18 => ['questionTitle' => 'Nom de votre structure'],
    ];
    private const SEAT_ADDRESS_CONFIG_BY_FORM_REFERENCE = [
        2 => [
            'associationQuestionTitles' => [
                'Association avec numéro SIRET / Adresse du siège social',
                'Association sans SIRET avec RNA / Adresse du siège social',
                'Association sans SIRET sans RNA / Adresse du siège social',
            ],
            'questionTitlesByStructure' => [
                'Association' => 'Association sans SIRET sans RNA / Adresse du siège social',
                'Entreprise' => 'Entreprise ou autre orga / Adresse du siège social',
                'Autre organisme privé' => 'Entreprise ou autre orga / Adresse du siège social',
                'Organisme public' => 'Organisme public / Adresse du siège social',
            ],
        ],
        3 => [
            'associationQuestionTitles' => [
                'Association avec numéro SIRET / Adresse du siège social',
                'Association sans SIRET avec RNA / Adresse du siège social',
                'Association sans SIRET sans RNA / Adresse du siège social',
            ],
            'questionTitlesByStructure' => [
                'Association' => 'Association sans SIRET sans RNA / Adresse du siège social',
                'Entreprise' => 'Entreprise ou autre orga / Adresse du siège social',
                'Autre organisme privé' => 'Entreprise ou autre orga / Adresse du siège social',
                'Organisme public' => 'Organisme public / Adresse du siège social',
            ],
        ],
        11 => [
            'questionTitles' => [
                'direct' => 'Adresse du siège social',
                'line1' => 'Siège social  - adresse ligne 1',
                'line2' => 'Siège social - adresse ligne 2',
                'line3' => 'Siège social - adresse ligne 3',
                'postalCode' => 'Siège social - adresse ligne 4 code postal',
                'city' => 'Siège social - adresse ligne 5 ville',
            ],
        ],
        16 => [
            'questionTitles' => [
                'line1' => 'Siège social - adresse ligne 1',
                'line2' => 'Siège social - adresse ligne 2',
                'line3' => 'Siège social - adresse ligne 3',
                'postalCode' => 'Siège social - adresse ligne 4 code postal',
                'city' => 'Siège social - adresse ligne 5 ville',
            ],
        ],
        18 => [
            'questionTitles' => [
                'line1' => 'Siège social - adresse ligne 1',
                'line2' => 'Siège social - adresse ligne 2',
                'line3' => 'Siège social - adresse ligne 3',
                'line4' => 'Siège social - adresse ligne 4',
                'postalCode' => 'Siège social - adresse ligne 4 code postal',
                'city' => 'Siège social - adresse ligne 5 ville',
            ],
        ],
    ];
    private const STRUCTURE_CONFIG_BY_FORM_REFERENCE = [
        2 => [
            'questionTitles' => [
                'Projet local' => 'Projet Local / Je suis...',
                'Grand projet' => 'Grand Projet / Je suis...',
            ],
            'labels' => [
                'Association' => 'Une association',
                'Entreprise' => 'Une entreprise',
                'Autre organisme privé' => 'Un autre organisme privé',
                'Organisme public' => 'Un organisme public',
            ],
        ],
        3 => [
            'questionTitles' => [
                'Projet local' => 'Projet Local / Je suis...',
                'Grand projet' => 'Grand Projet / Je suis...',
            ],
            'labels' => [
                'Association' => 'Une association',
                'Entreprise' => 'Une entreprise',
                'Autre organisme privé' => 'Un autre organisme privé',
                'Organisme public' => 'Un organisme public',
            ],
        ],
        7 => [
            'questionTitles' => [
                'Projet local' => 'Libellé Famille - Bénéficiaire',
                'Grand projet' => 'Libellé Famille - Bénéficiaire',
            ],
            'labels' => [
                'Association' => 'Association',
                'Entreprise' => 'Entreprise',
                'Organisme public' => 'Organisme public',
            ],
        ],
        11 => [
            'questionTitles' => [
                'Projet local' => 'Libellé Famille - Bénéficiaire',
                'Grand projet' => 'Libellé Famille - Bénéficiaire',
            ],
            'labels' => [
                'Association' => 'Association',
                'Entreprise' => 'Entreprise',
                'Autre organisme privé' => 'Autre organisme privé',
                'Organisme public' => 'Organisme public',
            ],
        ],
        15 => [
            'questionTitles' => [
                'Projet local' => 'Libellé Famille - Bénéficiaire',
                'Grand projet' => 'Libellé Famille - Bénéficiaire',
            ],
            'labels' => [
                'Association' => 'Associations',
                'Entreprise' => 'Entreprise',
                'Autre organisme privé' => 'Autre organisme privé',
                'Organisme public' => 'Organisme public',
            ],
        ],
        16 => [
            'questionTitles' => [
                'Projet local' => 'Libellé Famille - Bénéficiaire',
                'Grand projet' => 'Libellé Famille - Bénéficiaire',
            ],
            'labels' => [
                'Association' => 'Association',
                'Organisme public' => 'Organisme public',
            ],
        ],
        18 => [
            'questionTitles' => [
                'Projet local' => 'Libellé Famille - Bénéficiaire',
                'Grand projet' => 'Libellé Famille - Bénéficiaire',
            ],
            'labels' => [
                'Association' => 'Association',
                'Commune' => 'Commune',
                'Autre organisme public' => 'Organisme public',
                'Syndicat de communes ou mixtes' => 'Syndicat de communes ou mixtes',
                'Lycée ou collège public (EPLE)' => 'Lycée ou collège public (EPLE)',
            ],
        ],
    ];
    private const THEME_TITLES_BY_CSV_VALUE = [
        "L'alimentation" => "L'alimentation",
        "La propreté, les déchets et l'économie circulaire" => "La propreté, les déchets et l'économie circulaire",
        'La santé environnementale' => 'La santé environnementale',
        'Vélo et mobilités propres du quotidien' => 'Le vélo et mobilités propres du quotidien',
        "Les énergies renouvelables et l'efficacité énergétique" => "Les énergies renouvelables et l'efficacité énergétique",
        'Les espaces verts et la biodiversité' => 'Les espaces verts et la biodiversité',
    ];
    private const SUMMARY_MAX_LENGTH = 255;
    private const CSV_HEADERS = [
        'id',
        'date',
        'édition',
        'type de projet',
        'thématique',
        'structure',
        'porteur',
        'adresse siège social',
        'nom du projet',
        'nbr votes',
        'résumé',
        'description',
        'adresse du projet',
        "zone d'impact",
        'département',
        'commune',
        'code action',
        'intitulé action budgétaire',
        'subvention',
        'lien',
        'lat',
        'long',
        'visuel',
        'geo',
        'url_image',
    ];

    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly AbstractResponseRepository $abstractResponseRepository,
        private readonly ProposalDistrictRepository $proposalDistrictRepository,
        private readonly ThemeRepository $themeRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly ElasticsearchDoctrineListener $elasticsearchDoctrineListener,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this
            ->addArgument('filePath', InputArgument::REQUIRED, 'Path to the IDF CSV export.')
            ->addOption('delimiter', 'd', InputOption::VALUE_REQUIRED, 'CSV delimiter.', ';')
            ->addOption('apply', null, InputOption::VALUE_NONE, 'Persist the Proposal updates.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filePath = (string) $input->getArgument('filePath');
        $delimiter = (string) $input->getOption('delimiter');
        $apply = (bool) $input->getOption('apply');

        if (1 !== \strlen($delimiter)) {
            $io->error('The delimiter must be exactly one character.');

            return Command::FAILURE;
        }

        if (!is_file($filePath) || !is_readable($filePath)) {
            $io->error("CSV file not found or not readable: {$filePath}");

            return Command::FAILURE;
        }

        $fileSize = filesize($filePath);
        if (false === $fileSize) {
            $io->error("Unable to read the CSV file size: {$filePath}");

            return Command::FAILURE;
        }

        try {
            $log = $this->createLogFile($filePath);
        } catch (\Throwable $exception) {
            $io->error($exception->getMessage());

            return Command::FAILURE;
        }

        $io->section('CSV validation');
        $io->text('Checking the CSV structure and every data row.');
        $validationProgress = $io->createProgressBar(max(1, $fileSize));
        $validationProgress->start();

        $file = new \SplFileObject($filePath, 'r');
        $isCsvValid = $this->validateCsv($file, $delimiter, $log, $validationProgress);
        $validationProgress->finish();
        $io->newLine(2);

        if (!$isCsvValid) {
            $io->error(
                sprintf(
                    'CSV format errors found. Log: %s',
                    $log->getPathname()
                )
            );

            return Command::FAILURE;
        }

        $io->success('CSV validation completed successfully.');

        if ($apply) {
            $this->disableAutomaticElasticsearchIndexation();
        }

        $io->section('Proposal processing');
        $io->note(
            $apply
                ? 'Apply mode: Proposal updates will be persisted. Elasticsearch must be reindexed separately.'
                : 'Dry-run mode: no database update or Elasticsearch indexation will be persisted.'
        );

        $file = new \SplFileObject($filePath, 'r');
        $processingProgress = $io->createProgressBar(max(1, $fileSize));
        $processingProgress->start();
        $headerIndexes = [];
        $isHeader = true;
        $rowsRead = 0;
        $proposalsRead = 0;
        $proposalsToUpdate = 0;
        $rows = [];
        $rowNumber = 0;

        while (true) {
            $row = $file->fgetcsv($delimiter, '"', '');
            if (false === $row && $file->eof()) {
                break;
            }
            if ([null] === $row) {
                $this->updateProgress($processingProgress, $file);

                continue;
            }
            if (false === $row) {
                $this->updateProgress($processingProgress, $file);
                $processingProgress->finish();
                $io->newLine(2);
                $io->error('The CSV file changed after validation.');

                return Command::FAILURE;
            }

            if ($isHeader) {
                $headerIndexes = array_flip($this->normalizeCsvHeaders($row));
                $isHeader = false;
                $this->updateProgress($processingProgress, $file);

                continue;
            }

            ++$rowNumber;
            ++$rowsRead;
            $rows[] = [
                'rowNumber' => $rowNumber,
                'reference' => $this->extractReference($row, $headerIndexes),
                'values' => $row,
            ];
            if (self::BATCH_SIZE === \count($rows)) {
                $batchResult = null;

                try {
                    $batchResult = $this->processBatch($rows, $headerIndexes, $apply);
                } catch (\Throwable $exception) {
                    $this->writeBatchErrorLog($log, $rows, $exception);
                } finally {
                    $this->entityManager->clear();
                }

                if (null !== $batchResult) {
                    $proposalsRead += \count($batchResult['proposals']);
                    $proposalsToUpdate += $batchResult['updatedProposalCount'];
                    $this->writeBatchLog(
                        $log,
                        $rows,
                        $batchResult['proposals'],
                        $batchResult['partialReasonsByProposalReference']
                    );
                }
                $rows = [];
                $this->updateProgress($processingProgress, $file);
            }
        }

        // Process the remaining rows when the final batch contains fewer than 50 entries.
        if ([] !== $rows) {
            $batchResult = null;

            try {
                $batchResult = $this->processBatch($rows, $headerIndexes, $apply);
            } catch (\Throwable $exception) {
                $this->writeBatchErrorLog($log, $rows, $exception);
            } finally {
                $this->entityManager->clear();
            }

            if (null !== $batchResult) {
                $proposalsRead += \count($batchResult['proposals']);
                $proposalsToUpdate += $batchResult['updatedProposalCount'];
                $this->writeBatchLog(
                    $log,
                    $rows,
                    $batchResult['proposals'],
                    $batchResult['partialReasonsByProposalReference']
                );
            }
        }
        $processingProgress->finish();
        $io->newLine(2);

        $io->success(
            sprintf(
                '%d CSV row(s) read, %d Proposal(s) found and %d Proposal(s) %s. Log: %s',
                $rowsRead,
                $proposalsRead,
                $proposalsToUpdate,
                $apply ? 'updated' : 'to update',
                $log->getPathname()
            )
        );
        if ($apply && 0 < $proposalsToUpdate) {
            $io->warning([
                'Elasticsearch was not updated by this command.',
                'Run "bin/console capco:es:populate proposal" to reindex all Proposals.',
            ]);
        }

        return Command::SUCCESS;
    }

    private function validateCsv(
        \SplFileObject $file,
        string $delimiter,
        \SplFileObject $log,
        ProgressBar $progressBar
    ): bool {
        $isValid = true;
        $rowNumber = 0;
        $isHeader = true;
        $headerIndexes = [];
        $seenReferences = [];
        while (true) {
            $position = $this->getFilePosition($file);
            $row = $file->fgetcsv($delimiter, '"', '');
            $this->updateProgress($progressBar, $file);

            // Empty lines are ignored, they don't change anything.
            if ([null] === $row) {
                continue;
            }

            // If fgetcsv returned false, we might be at the end of file.
            if (false === $row && $file->eof()) {
                break;
            }

            // If fgetcsv returned false and we're not at the end of file, then it's a real error.
            if (false === $row) {
                ++$rowNumber;
                $isValid = false;
                $this->writeLogEntry($log, $rowNumber, 'unknown', 'error', 'Unable to read a CSV row.');
                if ($position === $this->getFilePosition($file)) {
                    $file->fgets();
                }

                continue;
            }

            // The first non-empty line has to be valid headers.
            if ($isHeader) {
                $headers = $this->normalizeCsvHeaders($row);

                try {
                    $this->validateCsvHeaders($headers);
                    $headerIndexes = array_flip($headers);
                } catch (\Throwable $exception) {
                    $isValid = false;
                    $this->writeLogEntry($log, 0, 'unknown', 'error', $exception->getMessage());
                }
                $isHeader = false;

                continue;
            }

            ++$rowNumber;
            $reference = $this->extractReference($row, $headerIndexes);

            try {
                $this->validateCsvRow($row);
                if (isset($headerIndexes['id'])) {
                    $this->validateProposalReference($reference, $seenReferences);
                }
            } catch (\Throwable $exception) {
                $isValid = false;
                $this->writeLogEntry($log, $rowNumber, $reference, 'error', $exception->getMessage());
            }
        }
        if ($isHeader) {
            $isValid = false;
            $this->writeLogEntry($log, 0, 'unknown', 'error', 'Unable to read the CSV header.');
        }

        return $isValid;
    }

    private function updateProgress(ProgressBar $progressBar, \SplFileObject $file): void
    {
        $progressBar->setProgress($this->getFilePosition($file));
    }

    /** @param list<string> $headers */
    private function validateCsvHeaders(array $headers): void
    {
        $expectedHeaders = self::CSV_HEADERS;
        sort($expectedHeaders);
        sort($headers);
        if ($expectedHeaders !== $headers) {
            throw new \RuntimeException('The CSV header does not contain exactly the expected columns.');
        }
    }

    /** @param list<null|string> $row */
    private function validateCsvRow(array $row): void
    {
        if (\count(self::CSV_HEADERS) !== \count($row)) {
            throw new \RuntimeException(
                sprintf('Expected %d columns, got %d.', \count(self::CSV_HEADERS), \count($row))
            );
        }
    }

    /** @param array<string, true> $seenReferences */
    private function validateProposalReference(string $reference, array &$seenReferences): void
    {
        $this->parseReference($reference);
        if (isset($seenReferences[$reference])) {
            throw new \RuntimeException("Duplicate proposal reference: {$reference}.");
        }

        $seenReferences[$reference] = true;
    }

    /**
     * @param list<null|string> $headers
     *
     * @return list<string>
     */
    private function normalizeCsvHeaders(array $headers): array
    {
        $normalizedHeaders = [];
        foreach ($headers as $header) {
            $normalizedHeaders[] = mb_strtolower((string) $header);
        }
        // Strip a possible UTF-8 BOM from the first CSV header.
        $normalizedHeaders[0] = preg_replace('/^\xEF\xBB\xBF/', '', $normalizedHeaders[0]);

        return $normalizedHeaders;
    }

    /**
     * @param list<null|string>  $row
     * @param array<string, int> $headerIndexes
     */
    private function extractReference(array $row, array $headerIndexes): string
    {
        if (!isset($headerIndexes['id'])) {
            return 'unknown';
        }

        $reference = trim((string) $row[$headerIndexes['id']], " \t\n\r\0\x0B\"'");

        return '' === $reference ? 'unknown' : $reference;
    }

    /**
     * @param list<null|string>  $row
     * @param array<string, int> $headerIndexes
     */
    private function getCsvValue(array $row, array $headerIndexes, string $header): string
    {
        return trim((string) $row[$headerIndexes[$header]]);
    }

    private function getFilePosition(\SplFileObject $file): int
    {
        $position = $file->ftell();
        if (false === $position) {
            throw new \RuntimeException('Unable to get the CSV file position.');
        }

        return $position;
    }

    /**
     * @throws \JsonException
     */
    private function formatAddress(string $formattedAddress, string $latitude, string $longitude, string $geo): ?string
    {
        if ('' === $formattedAddress) {
            return null;
        }

        $address = ['formatted_address' => $formattedAddress];
        $coordinates = $this->extractCoordinates($latitude, $longitude, $geo);
        if (null !== $coordinates) {
            $address['geometry'] = [
                'location' => $coordinates,
                'location_type' => '',
            ];
        }

        return json_encode([$address], \JSON_UNESCAPED_SLASHES | \JSON_UNESCAPED_UNICODE | \JSON_THROW_ON_ERROR);
    }

    /** @return null|array{lat: float, lng: float} */
    private function extractCoordinates(string $latitude, string $longitude, string $geo): ?array
    {
        if (is_numeric($latitude) && is_numeric($longitude)) {
            return ['lat' => (float) $latitude, 'lng' => (float) $longitude];
        }

        $coordinates = preg_split('/\s*,\s*/', $geo);
        if (
            false === $coordinates
            || 2 !== \count($coordinates)
            || !is_numeric($coordinates[0])
            || !is_numeric($coordinates[1])
        ) {
            return null;
        }

        return ['lat' => (float) $coordinates[0], 'lng' => (float) $coordinates[1]];
    }

    /**
     * @param list<array{
     *     rowNumber: int,
     *     reference: string,
     *     values: list<null|string>
     * }> $rows
     * @param array<string, int> $headerIndexes
     *
     * @throws \JsonException
     *
     * @return array{
     *     proposals: list<Proposal>,
     *     updatedProposalCount: int,
     *     partialReasonsByProposalReference: array<string, list<string>>
     * }
     */
    private function processBatch(array $rows, array $headerIndexes, bool $apply): array
    {
        $proposals = $this->findProposals($rows);
        $proposalsByReference = $this->indexProposalsByReference($proposals);
        $projectTypeResponsesByProposalId = $this->abstractResponseRepository
            ->findValueResponsesByProposalId(
                $proposals,
                array_map(
                    static fn (array $config): string => $config['questionTitle'],
                    self::PROJECT_TYPE_CONFIG_BY_FORM_REFERENCE
                )
            )
        ;
        $impactZoneResponsesByProposalId = $this->abstractResponseRepository
            ->findValueResponsesByProposalId(
                $proposals,
                array_map(
                    static fn (array $config): string => $config['questionTitle'],
                    self::IMPACT_ZONE_CONFIG_BY_FORM_REFERENCE
                )
            )
        ;
        $structureResponsesByProposalIdAndQuestionTitle = $this->abstractResponseRepository
            ->findValueResponsesByProposalIdAndQuestionTitle(
                $proposals,
                array_map(
                    static fn (array $config): array => array_values(array_unique(
                        $config['questionTitles']
                    )),
                    self::STRUCTURE_CONFIG_BY_FORM_REFERENCE
                )
            )
        ;
        $projectOwnerResponsesByProposalIdAndQuestionTitle = $this->abstractResponseRepository
            ->findValueResponsesByProposalIdAndQuestionTitle(
                $proposals,
                $this->getProjectOwnerQuestionTitlesByFormReference()
            )
        ;
        $seatAddressResponsesByProposalIdAndQuestionTitle = $this->abstractResponseRepository
            ->findValueResponsesByProposalIdAndQuestionTitle(
                $proposals,
                $this->getSeatAddressQuestionTitlesByFormReference()
            )
        ;
        $updatedProposalCount = 0;
        $partialReasonsByProposalReference = [];

        foreach ($rows as $row) {
            $proposal = $proposalsByReference[$row['reference']] ?? null;
            if (null === $proposal) {
                continue;
            }

            $partialReasonsByProposalReference[$row['reference']] = $this->updateProposalFromCsv(
                $proposal,
                $projectTypeResponsesByProposalId[$proposal->getId()] ?? null,
                $impactZoneResponsesByProposalId[$proposal->getId()] ?? null,
                $structureResponsesByProposalIdAndQuestionTitle[$proposal->getId()] ?? [],
                $projectOwnerResponsesByProposalIdAndQuestionTitle[$proposal->getId()] ?? [],
                $seatAddressResponsesByProposalIdAndQuestionTitle[$proposal->getId()] ?? [],
                $row['values'],
                $headerIndexes
            );
            ++$updatedProposalCount;
        }

        if ($apply && 0 < $updatedProposalCount) {
            $this->entityManager->flush();
        }

        return [
            'proposals' => $proposals,
            'updatedProposalCount' => $updatedProposalCount,
            'partialReasonsByProposalReference' => $partialReasonsByProposalReference,
        ];
    }

    /**
     * @param list<array{reference: string}> $rows
     *
     * @return list<Proposal>
     */
    private function findProposals(array $rows): array
    {
        $referencesByForm = [];
        foreach ($rows as $row) {
            [$formReference, $proposalReference] = $this->parseReference($row['reference']);
            $referencesByForm[$formReference][] = $proposalReference;
        }

        return $this->proposalRepository->findByFormAndReferences($referencesByForm);
    }

    /** @return array{int, int} */
    private function parseReference(string $reference): array
    {
        if (1 !== preg_match('/^(\d+)-(\d+)$/', $reference, $matches)) {
            throw new \RuntimeException("Invalid proposal reference: {$reference}.");
        }

        $formReference = (int) $matches[1];
        if (!\in_array($formReference, self::ALLOWED_PROPOSAL_FORM_REFERENCES, true)) {
            throw new \RuntimeException("Proposal form reference is not allowed: {$formReference}.");
        }

        return [$formReference, (int) $matches[2]];
    }

    /**
     * @param list<Proposal> $proposals
     *
     * @return array<string, Proposal>
     */
    private function indexProposalsByReference(array $proposals): array
    {
        $proposalsByReference = [];
        foreach ($proposals as $proposal) {
            $proposalsByReference[$this->getProposalReference($proposal)] = $proposal;
        }

        return $proposalsByReference;
    }

    private function getProposalReference(Proposal $proposal): string
    {
        return sprintf(
            '%d-%d',
            $proposal->getProposalForm()->getReference(),
            $proposal->getReference()
        );
    }

    /** @return array<int, list<string>> */
    private function getProjectOwnerQuestionTitlesByFormReference(): array
    {
        $questionTitlesByFormReference = [];
        foreach (self::PROJECT_OWNER_CONFIG_BY_FORM_REFERENCE as $formReference => $config) {
            $questionTitles = isset($config['questionTitle'])
                ? [$config['questionTitle']]
                : [
                    $config['grandProjectQuestionTitle'],
                    ...array_values($config['localProjectQuestionTitlesByStructure']),
                    ...$config['localAssociationQuestionTitles'],
                ];
            $questionTitlesByFormReference[$formReference] = array_values(array_unique(
                $questionTitles
            ));
        }

        return $questionTitlesByFormReference;
    }

    /** @return array<int, list<string>> */
    private function getSeatAddressQuestionTitlesByFormReference(): array
    {
        $questionTitlesByFormReference = [];
        foreach (self::SEAT_ADDRESS_CONFIG_BY_FORM_REFERENCE as $formReference => $config) {
            $questionTitles = isset($config['questionTitles'])
                ? array_values($config['questionTitles'])
                : [
                    ...array_values($config['questionTitlesByStructure']),
                    ...$config['associationQuestionTitles'],
                ];
            $questionTitlesByFormReference[$formReference] = array_values(array_unique(
                $questionTitles
            ));
        }

        return $questionTitlesByFormReference;
    }

    /**
     * @param array<string, ValueResponse> $structureResponsesByQuestionTitle
     * @param array<string, ValueResponse> $projectOwnerResponsesByQuestionTitle
     * @param array<string, ValueResponse> $seatAddressResponsesByQuestionTitle
     * @param list<null|string>            $row
     * @param array<string, int>           $headerIndexes
     *
     * @throws \JsonException
     *
     * @return list<string>
     */
    private function updateProposalFromCsv(
        Proposal $proposal,
        ?ValueResponse $projectTypeResponse,
        ?ValueResponse $impactZoneResponse,
        array $structureResponsesByQuestionTitle,
        array $projectOwnerResponsesByQuestionTitle,
        array $seatAddressResponsesByQuestionTitle,
        array $row,
        array $headerIndexes
    ): array {
        $summary = $this->getCsvValue($row, $headerIndexes, 'résumé');
        $partialReasons = [];
        if (
            !$this->restoreEstimation(
                $proposal,
                $this->getCsvValue($row, $headerIndexes, 'subvention')
            )
        ) {
            $partialReasons[] = 'Estimation skipped (already set, conflict or invalid CSV value).';
        }
        if (
            $proposal->getProposalForm()->isUsingDistrict()
            && !$this->restoreDistrict(
                $proposal,
                $this->getCsvValue($row, $headerIndexes, 'département')
            )
        ) {
            $partialReasons[] = 'District skipped (already set, conflict or invalid CSV value).';
        }
        if (
            !$this->restoreTheme(
                $proposal,
                $this->getCsvValue($row, $headerIndexes, 'thématique')
            )
        ) {
            $partialReasons[] = 'Theme skipped (already set or invalid CSV value).';
        }
        if (
            !$this->restoreProjectType(
                $proposal,
                $projectTypeResponse,
                $this->getCsvValue($row, $headerIndexes, 'type de projet')
            )
        ) {
            $partialReasons[] = 'Project type skipped (already set, conflict or invalid CSV value).';
        }
        if (
            !$this->restoreImpactZone(
                $proposal,
                $impactZoneResponse,
                $this->getCsvValue($row, $headerIndexes, "zone d'impact")
            )
        ) {
            $partialReasons[] = 'Impact zone skipped (already set, conflict or invalid CSV value).';
        }
        if (
            !$this->restoreStructure(
                $proposal,
                $structureResponsesByQuestionTitle,
                $this->getCsvValue($row, $headerIndexes, 'type de projet'),
                $this->getCsvValue($row, $headerIndexes, 'structure')
            )
        ) {
            $partialReasons[] = 'Structure skipped (already set, conflict or invalid CSV value).';
        }
        if (
            !$this->restoreProjectOwner(
                $proposal,
                $projectOwnerResponsesByQuestionTitle,
                $this->getCsvValue($row, $headerIndexes, 'type de projet'),
                $this->getCsvValue($row, $headerIndexes, 'structure'),
                $this->getCsvValue($row, $headerIndexes, 'porteur')
            )
        ) {
            $partialReasons[] = 'Project owner skipped (already set, conflict or invalid CSV value).';
        }
        if (
            !$this->restoreSeatAddress(
                $proposal,
                $seatAddressResponsesByQuestionTitle,
                $this->getCsvValue($row, $headerIndexes, 'type de projet'),
                $this->getCsvValue($row, $headerIndexes, 'structure'),
                $this->getCsvValue($row, $headerIndexes, 'adresse siège social')
            )
        ) {
            $partialReasons[] = 'Seat address skipped (already set, conflict or invalid CSV value).';
        }
        $proposal
            ->setTitle($this->getCsvValue($row, $headerIndexes, 'nom du projet'))
            ->setSummary('' === $summary ? null : mb_substr($summary, 0, self::SUMMARY_MAX_LENGTH))
            ->setBody($this->formatBody($this->getCsvValue($row, $headerIndexes, 'description')))
            ->setAddress(
                $this->formatAddress(
                    $this->getCsvValue($row, $headerIndexes, 'adresse du projet'),
                    $this->getCsvValue($row, $headerIndexes, 'lat'),
                    $this->getCsvValue($row, $headerIndexes, 'long'),
                    $this->getCsvValue($row, $headerIndexes, 'geo')
                )
            )
        ;

        return $partialReasons;
    }

    private function restoreEstimation(Proposal $proposal, string $csvValue): bool
    {
        if (null !== $proposal->getEstimation()) {
            return false;
        }

        $normalizedValue = str_replace(',', '.', $csvValue);
        if (1 !== preg_match('/^\d+(?:\.\d+)?$/D', $normalizedValue)) {
            return false;
        }

        $proposal->setEstimation((float) $normalizedValue);

        return true;
    }

    private function restoreDistrict(Proposal $proposal, string $csvValue): bool
    {
        $proposalForm = $proposal->getProposalForm();
        if (null !== $proposal->getDistrict()) {
            return false;
        }

        if (1 !== preg_match('/^(75|77|78|91|92|93|94|95)\b/', $csvValue, $matches)) {
            return false;
        }

        $district = $this->proposalDistrictRepository->findDistrictByName(
            self::DISTRICT_NAMES_BY_DEPARTMENT[$matches[1]],
            $proposalForm
        );
        if (null === $district) {
            return false;
        }

        $proposal->setDistrict($district, false);

        return true;
    }

    private function restoreTheme(Proposal $proposal, string $csvValue): bool
    {
        if (null !== $proposal->getTheme()) {
            return false;
        }

        $normalizedCsvValue = str_replace('’', "'", $csvValue);
        $themeTitle = self::THEME_TITLES_BY_CSV_VALUE[$normalizedCsvValue] ?? null;
        if (null === $themeTitle) {
            return false;
        }

        $theme = $this->themeRepository->findOneWithTitle($themeTitle);
        if (null === $theme) {
            return false;
        }

        $proposal->setTheme($theme);

        return true;
    }

    private function restoreProjectType(
        Proposal $proposal,
        ?ValueResponse $response,
        string $csvValue
    ): bool {
        $config = self::PROJECT_TYPE_CONFIG_BY_FORM_REFERENCE[
            $proposal->getProposalForm()->getReference()
        ] ?? null;
        if (
            null === $config
            || null === $response
            || $config['questionTitle'] !== $response->getQuestion()->getTitle()
        ) {
            return false;
        }

        $label = $config['labels'][$csvValue] ?? null;
        if (!$this->isValueResponseRestorable($response) || null === $label) {
            return false;
        }

        $response->setValue([
            'labels' => [$label],
            'other' => null,
        ]);

        return true;
    }

    private function restoreImpactZone(
        Proposal $proposal,
        ?ValueResponse $response,
        string $csvValue
    ): bool {
        $config = self::IMPACT_ZONE_CONFIG_BY_FORM_REFERENCE[
            $proposal->getProposalForm()->getReference()
        ] ?? null;
        if (
            null === $config
            || null === $response
            || '' === $csvValue
            || $config['questionTitle'] !== $response->getQuestion()->getTitle()
            || (!$this->isAnonymizedValueResponse($response) && null !== $response->getValue())
        ) {
            return false;
        }

        if (isset($config['choiceLabels'])) {
            if (!\in_array($csvValue, $config['choiceLabels'], true)) {
                return false;
            }

            $response->setValue([
                'labels' => [$csvValue],
                'other' => null,
            ]);

            return true;
        }

        $response->setValue($csvValue);

        return true;
    }

    /** @param array<string, ValueResponse> $responsesByQuestionTitle */
    private function restoreStructure(
        Proposal $proposal,
        array $responsesByQuestionTitle,
        string $csvProjectType,
        string $csvStructure
    ): bool {
        $config = self::STRUCTURE_CONFIG_BY_FORM_REFERENCE[
            $proposal->getProposalForm()->getReference()
        ] ?? null;
        $questionTitle = $config['questionTitles'][$csvProjectType] ?? null;
        $response = null === $questionTitle
            ? null
            : ($responsesByQuestionTitle[$questionTitle] ?? null);
        $label = $config['labels'][$csvStructure] ?? null;
        if (
            null === $response
            || null === $label
            || !$this->isValueResponseRestorable($response)
        ) {
            return false;
        }

        $response->setValue([
            'labels' => [$label],
            'other' => null,
        ]);

        return true;
    }

    /** @param array<string, ValueResponse> $responsesByQuestionTitle */
    private function restoreProjectOwner(
        Proposal $proposal,
        array $responsesByQuestionTitle,
        string $csvProjectType,
        string $csvStructure,
        string $csvProjectOwner
    ): bool {
        $config = self::PROJECT_OWNER_CONFIG_BY_FORM_REFERENCE[
            $proposal->getProposalForm()->getReference()
        ] ?? null;
        if (null === $config || '' === $csvProjectOwner) {
            return false;
        }

        if (isset($config['questionTitle'])) {
            $questionTitle = $config['questionTitle'];
        } elseif ('Grand projet' === $csvProjectType) {
            $questionTitle = $config['grandProjectQuestionTitle'];
        } elseif ('Projet local' === $csvProjectType) {
            $questionTitle = $config['localProjectQuestionTitlesByStructure'][$csvStructure] ?? null;
        } else {
            return false;
        }

        $response = null === $questionTitle
            ? null
            : ($responsesByQuestionTitle[$questionTitle] ?? null);
        if (null === $response) {
            return false;
        }

        $isEmptyAssociationResponseRestorable = 'Projet local' === $csvProjectType
            && 'Association' === $csvStructure
            && null === $response->getValue()
            && !$this->hasSetProjectOwnerResponse(
                $responsesByQuestionTitle,
                $config['localAssociationQuestionTitles']
            );
        if (
            !$this->isAnonymizedValueResponse($response)
            && !$isEmptyAssociationResponseRestorable
        ) {
            return false;
        }

        $response->setValue($csvProjectOwner);

        return true;
    }

    /** @param array<string, ValueResponse> $responsesByQuestionTitle */
    private function restoreSeatAddress(
        Proposal $proposal,
        array $responsesByQuestionTitle,
        string $csvProjectType,
        string $csvStructure,
        string $csvSeatAddress
    ): bool {
        $config = self::SEAT_ADDRESS_CONFIG_BY_FORM_REFERENCE[
            $proposal->getProposalForm()->getReference()
        ] ?? null;
        if (null === $config || '' === $csvSeatAddress) {
            return false;
        }

        if (isset($config['questionTitlesByStructure'])) {
            return $this->restoreConditionalSeatAddress(
                $responsesByQuestionTitle,
                $config,
                $csvProjectType,
                $csvStructure,
                $csvSeatAddress
            );
        }

        return $this->restoreSeatAddressLines(
            $responsesByQuestionTitle,
            $config['questionTitles'],
            $proposal->getProposalForm()->getReference(),
            $csvSeatAddress
        );
    }

    /**
     * @param array<string, ValueResponse> $responsesByQuestionTitle
     * @param array<string, mixed>         $config
     */
    private function restoreConditionalSeatAddress(
        array $responsesByQuestionTitle,
        array $config,
        string $csvProjectType,
        string $csvStructure,
        string $csvSeatAddress
    ): bool {
        if ('Projet local' !== $csvProjectType) {
            return false;
        }

        $questionTitle = $config['questionTitlesByStructure'][$csvStructure] ?? null;
        $response = null === $questionTitle
            ? null
            : ($responsesByQuestionTitle[$questionTitle] ?? null);
        if (null === $response) {
            return false;
        }

        $isAssociation = 'Association' === $csvStructure;
        if (
            $isAssociation
            && $this->hasSetSeatAddressResponse(
                $responsesByQuestionTitle,
                $config['associationQuestionTitles']
            )
        ) {
            return false;
        }

        if (
            !$this->isAnonymizedValueResponse($response)
            && (!$isAssociation || null !== $response->getValue())
        ) {
            return false;
        }

        $response->setValue($csvSeatAddress);

        return true;
    }

    /**
     * @param array<string, ValueResponse> $responsesByQuestionTitle
     * @param array<string, string>        $questionTitles
     */
    private function restoreSeatAddressLines(
        array $responsesByQuestionTitle,
        array $questionTitles,
        int $formReference,
        string $csvSeatAddress
    ): bool {
        if (
            !$this->areSeatAddressResponsesRestorable(
                $responsesByQuestionTitle,
                array_values($questionTitles)
            )
        ) {
            return false;
        }

        if (16 === $formReference) {
            $valuesByQuestionKey = ['city' => $csvSeatAddress];
        } else {
            $addressParts = $this->parseSeatAddress($csvSeatAddress);
            if (11 === $formReference && null === $addressParts) {
                return false;
            }
            $valuesByQuestionKey = null === $addressParts
                ? ['line3' => $csvSeatAddress]
                : [
                    'line3' => $addressParts['street'],
                    'postalCode' => $addressParts['postalCode'],
                    'city' => $addressParts['city'],
                ];
        }

        foreach ($questionTitles as $questionTitle) {
            $responsesByQuestionTitle[$questionTitle]->setValue('');
        }
        foreach ($valuesByQuestionKey as $questionKey => $value) {
            $responsesByQuestionTitle[$questionTitles[$questionKey]]->setValue($value);
        }

        return true;
    }

    /**
     * @param array<string, ValueResponse> $responsesByQuestionTitle
     * @param list<string>                 $questionTitles
     */
    private function areSeatAddressResponsesRestorable(
        array $responsesByQuestionTitle,
        array $questionTitles
    ): bool {
        $hasValueToRestore = false;
        foreach ($questionTitles as $questionTitle) {
            $response = $responsesByQuestionTitle[$questionTitle] ?? null;
            if (null === $response) {
                return false;
            }

            $value = $response->getValue();
            if ($this->isAnonymizedValueResponse($response) || null === $value) {
                $hasValueToRestore = true;

                continue;
            }
            if ('' !== $value) {
                return false;
            }
        }

        return $hasValueToRestore;
    }

    /**
     * @param array<string, ValueResponse> $responsesByQuestionTitle
     * @param list<string>                 $questionTitles
     */
    private function hasSetSeatAddressResponse(
        array $responsesByQuestionTitle,
        array $questionTitles
    ): bool {
        foreach ($questionTitles as $questionTitle) {
            $response = $responsesByQuestionTitle[$questionTitle] ?? null;
            if (
                null !== $response
                && null !== $response->getValue()
                && '' !== $response->getValue()
                && !$this->isAnonymizedValueResponse($response)
            ) {
                return true;
            }
        }

        return false;
    }

    /** @return null|array{street: string, postalCode: string, city: string} */
    private function parseSeatAddress(string $csvSeatAddress): ?array
    {
        if (
            1 !== preg_match(
                '/^(?:(?<street>.*?)\s+)?(?<postalCode>\d{5})\s+(?<city>.+)$/u',
                $csvSeatAddress,
                $matches
            )
        ) {
            return null;
        }

        return [
            'street' => trim($matches['street']),
            'postalCode' => $matches['postalCode'],
            'city' => trim($matches['city']),
        ];
    }

    /**
     * @param array<string, ValueResponse> $responsesByQuestionTitle
     * @param list<string>                 $questionTitles
     */
    private function hasSetProjectOwnerResponse(
        array $responsesByQuestionTitle,
        array $questionTitles
    ): bool {
        foreach ($questionTitles as $questionTitle) {
            $response = $responsesByQuestionTitle[$questionTitle] ?? null;
            if (
                null !== $response
                && null !== $response->getValue()
                && !$this->isAnonymizedValueResponse($response)
            ) {
                return true;
            }
        }

        return false;
    }

    private function isValueResponseRestorable(ValueResponse $response): bool
    {
        if ($this->isAnonymizedValueResponse($response)) {
            return true;
        }

        $value = $response->getValue();

        return \is_array($value)
            && isset($value['labels'])
            && [] === $value['labels']
            && \array_key_exists('other', $value)
            && null === $value['other'];
    }

    private function isAnonymizedValueResponse(ValueResponse $response): bool
    {
        $value = $response->getValue();

        return \is_string($value)
            && \in_array(
                $value,
                ['Contenu supprimé à la demande de son auteur', 'deleted-content-by-author'],
                true
            );
    }

    private function formatBody(string $body): ?string
    {
        if ('' === $body) {
            return null;
        }

        $formattedBody = '';
        $paragraphs = explode("\n\n", $body);
        $lastParagraphKey = array_key_last($paragraphs);
        foreach ($paragraphs as $key => $paragraph) {
            $formattedBody .= '<p>' . nl2br(trim($paragraph)) . '</p>';
            if ($key !== $lastParagraphKey) {
                $formattedBody .= '<br> ';
            }
        }

        return $formattedBody;
    }

    /**
     * @param list<array{
     *     rowNumber: int,
     *     reference: string,
     *     values: list<null|string>
     * }> $rows
     */
    private function writeBatchErrorLog(\SplFileObject $log, array $rows, \Throwable $exception): void
    {
        foreach ($rows as $row) {
            $this->writeLogEntry(
                $log,
                $row['rowNumber'],
                $row['reference'],
                'error',
                $exception->getMessage()
            );
        }
    }

    /**
     * @param list<array{
     *     rowNumber: int,
     *     reference: string,
     *     values: list<null|string>
     * }> $rows
     * @param list<Proposal>              $proposals
     * @param array<string, list<string>> $partialReasonsByProposalReference
     */
    private function writeBatchLog(
        \SplFileObject $log,
        array $rows,
        array $proposals,
        array $partialReasonsByProposalReference
    ): void {
        $proposalsByReference = $this->indexProposalsByReference($proposals);

        foreach ($rows as $row) {
            $proposal = $proposalsByReference[$row['reference']] ?? null;
            if (null === $proposal) {
                $this->writeLogEntry(
                    $log,
                    $row['rowNumber'],
                    $row['reference'],
                    'error',
                    'Proposal not found.'
                );
            } else {
                $partialReasons = $partialReasonsByProposalReference[$row['reference']];
                $this->writeLogEntry(
                    $log,
                    $row['rowNumber'],
                    $row['reference'],
                    [] !== $partialReasons ? 'partial' : 'success',
                    [] !== $partialReasons ? implode(' ', $partialReasons) : null
                );
            }
        }
    }

    private function disableAutomaticElasticsearchIndexation(): void
    {
        $this->entityManager->getEventManager()->removeEventListener(
            $this->elasticsearchDoctrineListener->getSubscribedEvents(),
            $this->elasticsearchDoctrineListener
        );
    }

    private function writeLogEntry(
        \SplFileObject $log,
        int $rowNumber,
        string $reference,
        string $status,
        ?string $reason = null
    ): void {
        $entry = sprintf(
            'row: %d reference: %s [%s]',
            $rowNumber,
            $reference,
            $status
        );
        if (null !== $reason) {
            $entry .= sprintf(' reason: %s', $reason);
        }

        if (false === $log->fwrite($entry . "\n")) {
            throw new \RuntimeException('Unable to write the log.');
        }
    }

    private function createLogFile(string $filePath): \SplFileObject
    {
        $logPath = \dirname($filePath)
            . \DIRECTORY_SEPARATOR
            . pathinfo($filePath, \PATHINFO_FILENAME)
            . '.'
            . (new \DateTimeImmutable())->format('Y-m-d_H-i-s')
            . '.log';

        return new \SplFileObject($logPath, 'w');
    }
}
