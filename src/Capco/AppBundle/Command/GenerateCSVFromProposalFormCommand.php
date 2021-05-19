<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\ProposalFormRepository;

class GenerateCSVFromProposalFormCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    protected static $defaultName = 'capco:import-proposals:generate-header-csv';
    protected string $projectRootDir;
    private ProposalFormRepository $proposalFormRepository;
    private ThemeRepository $themeRepository;

    public function __construct(
        ExportUtils $exportUtils,
        ProposalFormRepository $proposalFormRepository,
        ThemeRepository $themeRepository,
        string $projectRootDir
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->themeRepository = $themeRepository;
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
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): ?int
    {
        $proposalFormId = $input->getArgument('proposal-form');
        $delimiter = $input->getOption('delimiter');

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

        $filename = Text::sanitizeFileName($proposalForm->getTitle()) . '.csv';
        $header = array_merge($proposalForm->getFieldsUsed(), $proposalForm->getCustomFields());
        $writer = WriterFactory::create('csv', $delimiter);
        $fileName = '/tmp/' . $filename;
        $writer->openToFile($fileName);
        $writer->addRow(WriterEntityFactory::createRowFromArray($header));
        $this->addRowExample($writer, $header, $proposalForm);
        $writer->close();
        $this->executeSnapshot($input, $output, $filename, true, true);

        return 0;
    }

    private function addRowExample(
        WriterInterface &$writer,
        array $header,
        ProposalForm $proposalForm
    ) {
        $example = ['Titre de ma proposition', 'user@email.com'];
        $bodyHtml = <<<'EOF'
<h1>Titre</h1>  <p><br></p>  <p>Paragraphe, je suis un super paragraphe en html</p>  <p><br></p>  <p>Pragraphe 2 avec des mots <strong>gras</strong> <em>italique et </em><u>souligné.</u> En plus, j’ajoute un super <a href="https://cap-collectif.com">lien</a><u>.<br></u></p>
EOF;
        $category = $proposalForm->getCategories()->first()
            ? $proposalForm
                ->getCategories()
                ->first()
                ->getName()
            : '';
        $themes = $this->themeRepository->findBy([], ['createdAt' => 'ASC']);
        $theme = $themes ? $themes[0]->getTitle() : '';
        $district = $proposalForm->getDistricts()->first()
            ? $proposalForm
                ->getDistricts()
                ->first()
                ->getName()
            : '';
        $header = array_flip($header);
        if (isset($header['address'])) {
            $example = array_merge($example, [
                '[{"address_components":[{"long_name":"45","short_name":"45","types":["street_number"]},{"long_name":"Rue de Brest","short_name":"Rue de Brest","types":["route"]},{"long_name":"Rennes",  "short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"45 Rue de Brest, 35000 Rennes, France","geometry":{"location":{"lat":48.1133495,"lng":-1.6984153},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.11469848029149,"lng":-1.697066319708498},"southwest":{"lat":48.1120005197085,"lng":-1.699764280291502}}},"place_id":"ChIJ1wi1uoPgDkgREYKb8YA-iqY","types":["church","establishment","place_of_worship","point_of_interest"]}]',
            ]);
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
        if (isset($header['tipsmeee'])) {
            $example = array_merge($example, ['tipsmeeeID']);
        }
        if (isset($header['media_url'])) {
            $example = array_merge($example, [
                'https://environnement.brussels/sites/default/files/user_files/images/pages/ban_inspirons_1200x628_fr.png',
            ]);
        }
        if (isset($header['body'])) {
            $example = array_merge($example, [$bodyHtml]);
        }
        if (isset($header['summary'])) {
            $example = array_merge($example, ['Un résumé']);
        }
        if (isset($header['estimation'])) {
            $example = array_merge($example, ['1800']);
        }
        foreach ($proposalForm->getCustomFields() as $customField) {
            $example = array_merge($example, [$customField]);
        }
        $writer->addRow(WriterEntityFactory::createRowFromArray($example));
    }
}
