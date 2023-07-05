<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateCSVFromProposalFormCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    protected static $defaultName = 'capco:import-proposals:generate-header-csv';
    protected string $projectRootDir;
    private ProposalFormRepository $proposalFormRepository;
    private ThemeRepository $themeRepository;
    private string $locale;

    public function __construct(
        ExportUtils $exportUtils,
        ProposalFormRepository $proposalFormRepository,
        ThemeRepository $themeRepository,
        string $projectRootDir,
        string $locale
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->themeRepository = $themeRepository;
        $this->locale = $locale;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setDescription('Import idf proposals from CSV file with specified proposal form id')
            ->addArgument(
                'proposal-form',
                InputArgument::REQUIRED,
                'Please provide the proposal form id where you want to import proposals.'
            )
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force export if feature toggle "export" is disabled'
            )
            ->addOption(
                'isCliModel',
                false,
                InputOption::VALUE_NONE,
                'if true, generate model for cli import'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): ?int
    {
        $proposalFormId = $input->getArgument('proposal-form');
        $delimiter = $input->getOption('delimiter');
        $isCliModel = filter_var($input->getOption('isCliModel'), \FILTER_VALIDATE_BOOLEAN);

        // @var ProposalForm $proposalForm
        $proposalForm = $this->proposalFormRepository->find($proposalFormId);
        if (null === $proposalForm) {
            $output->writeln(
                '<error>Proposal Form with id ' .
                    $proposalFormId .
                    ' was not found in your database. Please create it or change the id.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        $filename =
            Text::sanitizeFileName($proposalForm->getProject()->getTitle()) .
            '-' .
            Text::sanitizeFileName($proposalForm->getStep()->getTitle()) .
            '_vierge.csv';
        setlocale(\LC_CTYPE, str_replace('-', '_', $this->locale));
        $filename = iconv('UTF-8', 'ASCII//TRANSLIT', $filename);
        $header = array_merge(
            $proposalForm->getFieldsUsed($isCliModel),
            $proposalForm->getCustomFields($isCliModel)
        );
        $writer = WriterFactory::create('csv', $delimiter);
        $fileName = '/tmp/' . $filename;
        $writer->openToFile($fileName);
        $writer->addRow(WriterEntityFactory::createRowFromArray($header));
        $this->addRowExample($writer, $header, $proposalForm, false, $isCliModel);
        $writer->close();
        $this->executeSnapshot($input, $output, $filename, true, true);

        return 0;
    }

    private function addRowExample(
        WriterInterface &$writer,
        array $initHeader,
        ProposalForm $proposalForm,
        $next = false,
        $isCliModel = false
    ) {
        $email = !$next ? 'jean.dupont@email.com' : 'julie.martin@email.com';
        // title, email, cost
        $example = ['texte brut', $email, 'nombre'];
        $categories = $proposalForm->getCategories();
        $category = $categories->first() ? $categories->first()->getName() : '';
        $themes = $this->themeRepository->findBy([], ['createdAt' => 'ASC']);
        $theme = $themes ? $themes[0]->getTitle() : '';
        $districts = $proposalForm->getDistricts();
        $district = $districts->first() ? $districts->first()->getName() : '';
        if ($next) {
            $category = $categories->next();
            $category = $category ? $category->getName() : '';
            $theme = $themes && isset($themes[1]) ? $themes[1]->getTitle() : '';
            $district = $districts->next();
            $district = $district ? $district->getName() : '';
        }

        $header = array_flip($initHeader);
        if (isset($header['address'])) {
            $address = !$next ? 'Format Geocoding' : 'Tour Eiffel, 75007 Paris';
            $example = array_merge($example, [$address]);
        }
        if (isset($header['category'])) {
            $example = array_merge($example, [$category]);
        }
        if (isset($header['theme'])) {
            $example = array_merge($example, [$theme]);
        }
        if (isset($header['district'])) {
            $example = array_merge($example, [$district]);
        }
        if (isset($header['media_url'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['body'])) {
            $example = array_merge($example, ['texte brut ou html']);
        }
        if (isset($header['summary'])) {
            $example = array_merge($example, ['texte brut']);
        }
        if (isset($header['webPageUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['linkedInUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['youtubeUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['facebookUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['twitterUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['instagramUrl'])) {
            $example = array_merge($example, ['URL']);
        }
        if (isset($header['status'])) {
            $status = $proposalForm->getStep()->getStatuses()->first();
            $example = array_merge($example, [$status->getName()]);
        }
        foreach (
            $proposalForm->getFieldsType($proposalForm->getRealQuestions(), $next, $isCliModel)
            as $field => $type
        ) {
            $example = array_merge($example, [$type]);
        }

        $writer->addRow(WriterEntityFactory::createRowFromArray($example));

        if (!$next) {
            $this->addRowExample($writer, $initHeader, $proposalForm, true, $isCliModel);
        }
    }
}
