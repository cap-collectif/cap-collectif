<?php

namespace Capco\AppBundle\Import;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\MajorityVoteTypeEnum;
use Capco\AppBundle\GraphQL\Mutation\AddProposalsFromCsvMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalMutation;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\SpoutHelper;
use Capco\AppBundle\Utils\Text;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Maximal\Emoji\Detector;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ImportProposalsFromCsv
{
    use TranslationTrait;

    private ?string $projectDir;
    private ?string $filePath;
    private ?string $delimiter;
    private ?ProposalForm $proposalForm;
    private array $customFields = [];
    private EntityManagerInterface $om;
    private MediaManager $mediaManager;
    private ProposalDistrictRepository $districtRepository;
    private ProposalCategoryRepository $proposalCategoryRepository;
    private ProposalRepository $proposalRepository;
    private StatusRepository $statusRepository;
    private UserRepository $userRepository;
    private Map $map;
    private array $headers;
    private LoggerInterface $logger;
    private ThemeRepository $themeRepository;
    private Indexer $indexer;
    private array $createdProposals = [];
    private int $importableProposals = 0;
    private array $badData = [];
    private array $mandatoryMissing = [];
    private ?Proposal $lastEntity = null;
    private TokenGeneratorInterface $tokenGenerator;
    private ValidatorInterface $validator;
    private TranslatorInterface $translator;

    public function __construct(
        MediaManager $mediaManager,
        ProposalDistrictRepository $districtRepository,
        ProposalCategoryRepository $proposalCategoryRepository,
        ProposalRepository $proposalRepository,
        StatusRepository $statusRepository,
        UserRepository $userRepository,
        Map $map,
        EntityManagerInterface $om,
        ThemeRepository $themeRepository,
        Indexer $indexer,
        LoggerInterface $logger,
        TokenGeneratorInterface $tokenGenerator,
        ValidatorInterface $validator,
        TranslatorInterface $translator,
        string $projectDir
    ) {
        $this->mediaManager = $mediaManager;
        $this->districtRepository = $districtRepository;
        $this->proposalCategoryRepository = $proposalCategoryRepository;
        $this->proposalRepository = $proposalRepository;
        $this->statusRepository = $statusRepository;
        $this->userRepository = $userRepository;
        $this->map = $map;
        $this->om = $om;
        $this->themeRepository = $themeRepository;
        $this->indexer = $indexer;
        $this->logger = $logger;
        $this->tokenGenerator = $tokenGenerator;
        $this->projectDir = $projectDir;
        $this->validator = $validator;
        $this->translator = $translator;
    }

    public function setProposalForm(ProposalForm $proposalForm): void
    {
        $this->proposalForm = $proposalForm;
    }

    public function setFilePath(string $filePath): void
    {
        $this->filePath = $filePath;
    }

    public function setDelimiter(string $delimiter): void
    {
        $this->delimiter = $delimiter;
    }

    public function setCustomFields(array $customFields): void
    {
        $this->customFields = $customFields;
    }

    public function import(
        bool $dryRun = true,
        bool $skipDuplicateLines = true,
        bool $isCli = true,
        ?OutputInterface $output = null
    ): array {
        $this->setCustomFields($this->proposalForm->getCustomFields($isCli));
        $this->headers = array_flip(
            array_merge($this->proposalForm->getFieldsUsed($isCli), $this->customFields)
        );
        $reader = $this->getRecords();
        /** @var \Box\Spout\Reader\CSV\RowIterator $rows */
        $rows = $reader
            ->getSheetIterator()
            ->current()
            ->getRowIterator()
        ;
        $rows->rewind();
        $countRows = iterator_count($rows);
        if (!$isCli && $countRows > AddProposalsFromCsvMutation::MAX_LINES) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::TOO_MUCH_LINES);
        }

        if ($countRows < 2) {
            throw new \RuntimeException(AddProposalsFromCsvMutation::EMPTY_FILE);
        }
        $rows->rewind();

        if (!$this->isValidHeaders($rows->current()->toArray())) {
            if ($isCli) {
                $missing = $this->getMissingHeaders($rows->current()->toArray());
                $headersJoined = implode(',', $rows->current()->toArray());

                throw new \RuntimeException(\count($missing) . ' missing headers : ' . implode(', ', $missing) . "file {$this->filePath} , header expected " . implode(',', array_keys($this->headers)) . " header filled {$headersJoined} count {$countRows}");
            }

            throw new \RuntimeException(AddProposalsFromCsvMutation::BAD_DATA_MODEL);
        }

        $associativeRowsWithHeaderLine = $this->getAssociativeRowsColumns($reader);
        if (empty($this->proposalForm->getStep())) {
            throw new \RuntimeException('STEP_NOT_FOUND');
        }
        $duplicateLinesToBeSkipped = $skipDuplicateLines
            ? $this->getDuplicates($associativeRowsWithHeaderLine)
            : [];
        if ($output) {
            $progress = new ProgressBar($output, $countRows - 1);
            $progress->start();
        }
        $this->importableProposals = 0;
        $this->loopRows(
            $associativeRowsWithHeaderLine,
            $duplicateLinesToBeSkipped,
            $dryRun,
            $isCli
        );

        if (!$dryRun && !empty($this->createdProposals)) {
            try {
                foreach ($this->createdProposals as $proposal) {
                    $this->om->persist($proposal);
                }
                $this->om->flush();

                foreach ($this->createdProposals as $proposal) {
                    $this->indexer->index(Proposal::class, $proposal->getId());
                }
                $this->indexer->finishBulk();

                if ($output) {
                    $progress->finish();
                }
            } catch (\RuntimeException $e) {
                $this->logger->error('Error when flushing proposals : ' . $e->getMessage());

                throw $e;
            }
        }

        return [
            'importedProposals' => !$dryRun && !empty($this->createdProposals) ? $this->createdProposals : [],
            'importableProposals' => $this->importableProposals,
            'badLines' => $this->badData,
            'duplicates' => array_values($duplicateLinesToBeSkipped),
            'mandatoryMissing' => $this->mandatoryMissing,
            'errorCode' => null,
        ];
    }

    // TODO MEDIA Question
    public function checkIfCustomQuestionResponseIsValid(array $row, int $key): bool
    {
        foreach ($this->customFields as $questionTitle) {
            $question = $this->proposalForm->getQuestionByTitle($questionTitle);

            switch ($question->getType()) {
                case AbstractQuestion::QUESTION_TYPE_SELECT:
                case AbstractQuestion::QUESTION_TYPE_RADIO:
                case AbstractQuestion::QUESTION_TYPE_BUTTON:
                    if (
                        $question instanceof MultipleChoiceQuestion
                        && (($question->isRequired() || !empty($row[$questionTitle]))
                            && !$question->isChoiceValid(trim($row[$questionTitle]))
                            && !$question->isOtherAllowed())
                    ) {
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $this->logger->error(
                            sprintf(
                                'bad data for question %s in line %d with value %s',
                                trim($questionTitle),
                                $key,
                                $row[$questionTitle]
                            )
                        );

                        return false;
                    }

                    break;

                case AbstractQuestion::QUESTION_TYPE_NUMBER:
                    if (!empty($row[$questionTitle]) && !is_numeric($row[$questionTitle])) {
                        $this->badData = $this->incrementBadData($this->badData, $key);
                        $this->logger->error(
                            sprintf(
                                'bad data for question %s in line %d with value %s',
                                trim($questionTitle),
                                $key,
                                $row[$questionTitle]
                            )
                        );

                        return false;
                    }

                    break;

                case AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION:
                    if (!empty($row[$questionTitle])) {
                        $majorityJudgementKeys = MajorityVoteTypeEnum::getI18nKeys();
                        $csvValue = ucfirst(strtolower($row[$questionTitle]));
                        $translationExist = $this->doesTranslationExist($csvValue);
                        $translationsFlipped = array_flip($this->getAllTranslationKey());
                        if (
                            !$translationExist
                            || !\in_array($translationsFlipped[$csvValue], $majorityJudgementKeys)
                        ) {
                            $this->badData = $this->incrementBadData($this->badData, $key);
                            $this->logger->error(
                                sprintf(
                                    'bad data for question %s in line %d with value %s',
                                    trim($questionTitle),
                                    $key,
                                    $row[$questionTitle]
                                )
                            );

                            return false;
                        }
                    }
            }
        }

        return true;
    }

    private function getRecords(): Reader
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->projectDir . $this->filePath);

        return $reader;
    }

    private function getAssociativeRowsColumns(Reader $reader): array
    {
        $rowWithHeaderKeys = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            //Initialize SpoutHelper with the current Sheet and       the row number which contains the header
            $spoutHelper = new SpoutHelper($sheet, 1);

            foreach ($sheet->getRowIterator() as $key => $row) {
                //Get the indexed array with col name as key and col val as value`
                $rowWithHeaderKeys[] = $spoutHelper->rowWithFormattedHeaders($row->toArray());
            }
        }

        return $rowWithHeaderKeys;
    }

    private function isValidRow(array $row, array $mandatoryMissing, int $key): array
    {
        $fields = $this->proposalForm->getMandatoryFieldsUsed();
        foreach ($fields as $field => $mandatory) {
            if ($mandatory && empty($row[$field])) {
                $mandatoryMissing = $this->incrementBadData($mandatoryMissing, $key);
            }
        }

        return $mandatoryMissing;
    }

    private function isValidHeaders(array $fileHeader): bool
    {
        return array_flip($fileHeader) === $this->headers;
    }

    private function getMissingHeaders(array $fileHeaders): array
    {
        $fileHeaders = array_flip($fileHeaders);
        $missingHeaders = [];
        foreach ($this->headers as $requestedHeader) {
            if (!\in_array($requestedHeader, $fileHeaders)) {
                $missingHeaders[] = $requestedHeader;
            }
        }

        return $missingHeaders;
    }

    private function setProposalReferenceAndModerationToken(Proposal $proposal): void
    {
        if (!$this->lastEntity) {
            $this->lastEntity = $this->proposalRepository->findOneBy(
                ['proposalForm' => $proposal->getProposalForm()],
                ['createdAt' => 'DESC', 'reference' => 'DESC']
            );
        }
        if (null === $this->lastEntity) {
            $proposal->setReference(1);
        } else {
            $proposal->setReference($this->lastEntity->getReference() + 1);
        }
        $token = $this->tokenGenerator->generateToken();
        $proposal->setModerationToken($token);
        $this->lastEntity = $proposal;
    }

    private function getDuplicates(array $rows): array
    {
        $duplicateLinesToBeSkipped = [];
        $proposals = [];
        /** @var Row $row */
        foreach ($rows as $key => $row) {
            ++$key;
            if (1 === $key) {
                continue;
            }
            $current = [$row['title'], $row['author']];
            if (\in_array($current, $proposals)) {
                $duplicateLinesToBeSkipped[] = $key;
            } elseif (
                $this->proposalRepository->getProposalByEmailAndTitleOnProposalForm(
                    trim($row['title']),
                    trim($row['author']),
                    $this->proposalForm
                ) > 0
            ) {
                $duplicateLinesToBeSkipped[] = $key;
            }
            $proposals[] = $current;
        }

        return $duplicateLinesToBeSkipped;
    }

    private function loopRows(
        array $rows,
        array $duplicateLinesToBeSkipped,
        bool $dryRun = true,
        bool $isCli = false
    ) {
        foreach ($rows as $key => $row) {
            $isCurrentLineFail = false;
            // array start at 0, csv start at 1
            ++$key;
            // skip header
            if (1 === $key) {
                continue;
            }
            if (\in_array($key, $duplicateLinesToBeSkipped)) {
                continue;
            }

            // if row is not valid
            $this->mandatoryMissing = $this->isValidRow($row, $this->mandatoryMissing, $key);
            if (!empty($this->mandatoryMissing[$key])) {
                $this->logger->error(
                    sprintf(
                        '%d fields mandatory are missing in line %d',
                        $this->mandatoryMissing[$key],
                        $key
                    )
                );

                $isCurrentLineFail = true;
            }

            try {
                foreach ($row as &$column) {
                    if (Detector::containsEmoji($column)) {
                        $column = Detector::removeEmoji($column);
                    }
                }
                list(
                    'isCurrentLineFail' => $isCurrentLineFail,
                    'author' => $author,
                    'category' => $category,
                    'theme' => $theme,
                    'district' => $district,
                    'media' => $media,
                    'status' => $status,
                    'address' => $address) = $this->verifyData($row, $dryRun, $isCli, $isCurrentLineFail, $key);
            } catch (\Exception $exception) {
                $this->logger->error($exception->getMessage());

                throw $exception;
            }
            if (!$dryRun && !$isCurrentLineFail && $author) {
                $this->createdProposals[$key] = $this->createProposal(
                    $row,
                    $author,
                    $district,
                    $status,
                    $theme,
                    $category,
                    $media,
                    $address
                );
            } elseif ($dryRun && $author && !$isCurrentLineFail) {
                ++$this->importableProposals;
            }
        }
    }

    private function verifyData(
        array $row,
        bool $dryRun,
        bool $isCli,
        bool $isCurrentLineFail,
        int $key
    ): array {
        $address = $category = $media = $theme = $district = null;
        $status = $this->proposalForm->getStep()->getDefaultStatus();

        if ($this->proposalForm->getUsingAddress() && !empty($row['address'])) {
            if (Text::isJSON($row['address'])) {
                $address = json_decode($row['address'], true);
                if (!isset($address[0]['address_components'])) {
                    $isCurrentLineFail = true;
                    $this->badData = $this->incrementBadData($this->badData, $key);
                    $this->logger->error('bad data address in line ' . $key);
                }
                $address = $row['address'];
            } else {
                $address = $this->map->getFormattedAddress($row['address']);
                if (!$address) {
                    $isCurrentLineFail = true;
                    $this->badData = $this->incrementBadData($this->badData, $key);
                    $this->logger->error('bad data address in line ' . $key);
                }
            }
        }
        if ($this->proposalForm->isUsingDistrict() && !empty($row['district'])) {
            if (
                !($district = $this->districtRepository->findDistrictByName(
                    trim($row['district']),
                    $this->proposalForm
                ))
            ) {
                $isCurrentLineFail = true;
                $this->badData = $this->incrementBadData($this->badData, $key);
                $this->logger->error('bad data district in line ' . $key);
            }
        }
        if (isset($row['status']) && !empty($row['status'])) {
            if (
                !($status = $this->statusRepository->findOneBy([
                    'name' => trim($row['status']),
                    'step' => $this->proposalForm->getStep(),
                ]))
            ) {
                $isCurrentLineFail = true;
                $this->badData = $this->incrementBadData($this->badData, $key);
                $this->logger->error('bad data statute in line ' . $key);
            }
        }
        if ($this->proposalForm->isUsingThemes() && !empty($row['theme'])) {
            $theme = str_replace('’', "'", trim($row['theme']));
            if (!($theme = $this->themeRepository->findOneWithTitle($theme))) {
                $this->badData = $this->incrementBadData($this->badData, $key);
                $isCurrentLineFail = true;
                $this->logger->error('bad data theme in line ' . $key . ' : ' . $theme);
            }
        }
        if ($this->proposalForm->isUsingCategories() && !empty($row['category'])) {
            if (
                !($category = $this->proposalCategoryRepository->findOneBy([
                    'name' => trim($row['category']),
                    'form' => $this->proposalForm,
                ]))
            ) {
                $this->badData = $this->incrementBadData($this->badData, $key);
                $isCurrentLineFail = true;
                $this->logger->error(
                    sprintf(
                        'bad data category in line %d, for category %s',
                        $key,
                        trim($row['category'])
                    )
                );
            }
        }
        if (!($author = $this->userRepository->findOneByEmail(trim($row['author'])))) {
            $this->badData = $this->incrementBadData($this->badData, $key);
            $isCurrentLineFail = true;
            $this->logger->error('bad data author in line ' . $key);
        }
        if ($this->proposalForm->isUsingIllustration() && !empty($row['media_url']) && $isCli) {
            if (!($media = $this->getMedia($row['media_url'], $dryRun))) {
                $this->badData = $this->incrementBadData($this->badData, $key);
                $isCurrentLineFail = true;
                $this->logger->error('bad data media_url in line ' . $key);
            }
        }
        if (
            $this->proposalForm->isUsingAnySocialNetworks()
            && !$this->proposalForm->checkIfSocialNetworksAreGood($row, $this->validator)
        ) {
            $this->badData = $this->incrementBadData($this->badData, $key);
            $isCurrentLineFail = true;
            $this->logger->error('bad data social_networks_url in line ' . $key);
        }
        if (
            \count($this->customFields) > 0
            && !$this->checkIfCustomQuestionResponseIsValid($row, $key)
        ) {
            $isCurrentLineFail = true;
        }
        if (!empty($row['cost']) && !is_numeric($row['cost'])) {
            $this->badData = $this->incrementBadData($this->badData, $key);
            $isCurrentLineFail = true;
            $this->logger->error('bad data cost in line ' . $key);
        }

        return compact(
            'isCurrentLineFail',
            'author',
            'media',
            'category',
            'theme',
            'district',
            'address',
            'status'
        );
    }

    private function incrementBadData(array $badData, int $line): array
    {
        if (isset($badData[$line])) {
            ++$badData[$line];
        } else {
            $badData[$line] = 1;
        }

        return $badData;
    }

    private function getMedia(?string $url, $dryRun = false): ?Media
    {
        if ($url && filter_var($url, \FILTER_VALIDATE_URL)) {
            $arrContextOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ];

            $mediaBinaryFile = @file_get_contents(
                $url,
                false,
                stream_context_create($arrContextOptions)
            );
            if (!$mediaBinaryFile) {
                $this->logger->error('Error on get file ' . $url);

                return null;
            }
            $fileUrl = explode('/', $url);
            $mediaName = end($fileUrl);
            $filePath = '/tmp/' . $mediaName;
            if (!file_put_contents($filePath, $mediaBinaryFile)) {
                $this->logger->error('Error on create file ' . $filePath);
            }

            return $this->mediaManager->createImageFromPath($filePath, $mediaName, $dryRun);
        }

        return null;
    }

    private function createProposal(
        array $row,
        User $author,
        ?ProposalDistrict $district,
        ?Status $status,
        ?Theme $theme,
        ?ProposalCategory $category,
        ?Media $media,
        ?string $address
    ): Proposal {
        $proposal = (new Proposal())
            ->setTitle($row['title'])
            ->setAuthor($author)
            ->setProposalForm($this->proposalForm)
            ->setDistrict($district)
            ->setStatus($status)
            ->setTheme($theme)
            ->setMedia($media)
            ->setPublishedAt(new \DateTime())
        ;
        if (isset($row['cost']) && is_numeric($row['cost'])) {
            $proposal->setEstimation($row['cost']);
        }
        if ($this->proposalForm->getUsingAddress() && $address) {
            $proposal->setAddress($address);
        }
        if (
            $this->proposalForm->isUsingEstimation()
            && !empty($row['estimation'])
            && is_numeric($row['estimation'])
        ) {
            $proposal->setEstimation((float) $row['estimation']);
        }

        if ($this->proposalForm->isUsingCategories()) {
            $proposal->setCategory($category);
        }

        if ($this->proposalForm->getUsingSummary() && !empty($row['summary'])) {
            $proposal->setSummary($row['summary']);
        }
        if ($this->proposalForm->getUsingDescription() && !empty($row['body'])) {
            $proposal->setBody($row['body']);
        }

        if ($this->proposalForm->isUsingAnySocialNetworks()) {
            ProposalMutation::hydrateSocialNetworks(
                $row,
                $proposal,
                $this->proposalForm,
                true,
                false
            );
        }
        $this->setProposalReferenceAndModerationToken($proposal);

        if (\count($this->customFields) > 0) {
            foreach ($this->customFields as $questionTitle) {
                $question = $this->proposalForm->getQuestionByTitle($questionTitle);
                $response = new ValueResponse();
                $value = trim($row[$questionTitle]) ?? '';
                if (
                    $question instanceof MultipleChoiceQuestion
                    && \in_array($question->getType(), [
                        AbstractQuestion::QUESTION_TYPE_RADIO,
                        AbstractQuestion::QUESTION_TYPE_BUTTON,
                    ])
                ) {
                    $value = sprintf(
                        '{"labels":["%s"], "other": null}',
                        trim($row[$questionTitle]) ?? ''
                    );
                    if (!$question->isChoiceValid($value)) {
                        if ($question->isOtherAllowed()) {
                            $value = sprintf(
                                '{"labels":[], "other": "%s"}',
                                trim($row[$questionTitle]) ?? ''
                            );
                        }
                    }
                } elseif ($question instanceof SimpleQuestion) {
                    if ('number' === $question->getInputType()) {
                        $value = (float) trim($row[$questionTitle]);
                    } elseif (
                        AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION ===
                            $question->getType()
                        && !empty($row[$questionTitle])
                    ) {
                        $csvValue = ucfirst(strtolower($row[$questionTitle]));
                        $translationsFlipped = array_flip($this->getAllTranslationKey());
                        $csvKeyFromValue = $translationsFlipped[$csvValue];
                        $value = MajorityVoteTypeEnum::getCodeFromTranslationKey($csvKeyFromValue);
                    }
                }

                $response = $response->setQuestion($question)->setValue($value);
                $proposal->addResponse($response);
            }
        }

        return $proposal;
    }
}
