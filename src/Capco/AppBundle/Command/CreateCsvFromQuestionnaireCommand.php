<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;
use Symfony\Component\Translation\TranslatorInterface;

class CreateCsvFromQuestionnaireCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private $toggleManager;
    private $projectDownloadResolver;
    private $questionnaireRepository;
    private $pathResolver;
    private const EXTENSION = '.csv';
    protected $customFields;
    protected $translator;

    /**
     * @var WriterInterface
     */
    protected $writer;
    protected $projectRootDir;


    public function __construct(
        ExportUtils $exportUtils,
        ProjectDownloadResolver $projectDownloadResolver,
        QuestionnaireRepository $questionnaireRepository,
        QuestionnaireExportResultsUrlResolver $pathResolver,
        TranslatorInterface $translator,
        Manager $manager,
        string $projectRootDir
    )
    {
        $this->toggleManager = $manager;
        $this->projectDownloadResolver = $projectDownloadResolver;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->pathResolver = $pathResolver;
        $this->customFields = [];
        $this->projectRootDir = $projectRootDir;
        $this->translator = $translator;
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:questionnaire')
            ->setDescription('Create csv file from questionnaire step data')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force export if feature toggle "export" is disabled'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        $questionnaires = $this->questionnaireRepository->findAll();
        foreach ($questionnaires as $questionnaire) {
            $fileName = $this->getFileName($questionnaire);
            $this->generateSheet($questionnaire, $fileName);
            $this->executeSnapshot($input, $output, $fileName);
        }

    }


    public function generateSheet(Questionnaire $questionnaire, string $fileName): void
    {
        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $headers = $this->projectDownloadResolver->getQuestionnaireHeaders($questionnaire);
        $formattedHeaders = [];
        foreach ($headers as $header) {
            if (\is_array($header)) {
                $formattedHeaders[] = $header['label'];
            } else {
                $formattedHeaders[] = $header;
            }
        }
        $this->writer->addRow($formattedHeaders);

        $formattedEntries = $this->getFormattedData($questionnaire);
        $rows = [];
        foreach ($formattedEntries as $formattedData) {
            $row = [];
            foreach ($formattedHeaders as $header) {
                $row[] = array_key_exists($header, $formattedData) ? $formattedData[$header] : '';
            }
            $rows[] = $row;
        }
        $this->writer->addRows($rows);
        $this->writer->close();
    }

    public function getFormattedData(Questionnaire $questionnaire): array
    {
        $data = $this->projectDownloadResolver->getQuestionnaireData($questionnaire);
        foreach ($data as &$d) {
            foreach ($d as $key => $value) {
                $d[$key] = $this->exportUtils->parseCellValue($this->projectDownloadResolver->formatText($value));
            }
        }
        return $data;
    }

    public function getFileName(Questionnaire $questionnaire): string
    {
        $step = $questionnaire->getStep();
        if (!$step) {
            return $questionnaire->getSlug() . self::EXTENSION;
        }

        $fileName = '';
        $project = $step->getProject();

        if ($project) {
            $fileName .= $project->getSlug() . '_';
        }
        $fileName .= $step->getSlug() . self::EXTENSION;

        return $fileName;
    }
}
