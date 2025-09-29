<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ImportConsultationFromCsvCommand extends Command
{
    private $filePath;
    private $delimiter;

    public function __construct(
        ?string $name,
        private readonly ContainerInterface $container
    ) {
        parent::__construct($name);
    }

    protected function configure()
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
                InputArgument::REQUIRED,
                'Please provide the slug of the consultation step you want to use'
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
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        return $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getOption('delimiter');
        $userEmail = $input->getArgument('user');
        $consultationStepSlug = $input->getArgument('step');

        $em = $this->getContainer()
            ->get('doctrine')
            ->getManager()
        ;

        $user = $this->getContainer()
            ->get('fos_user.user_manager')
            ->findUserByEmail($userEmail)
        ;
        $consultationStep = $this->getContainer()
            ->get(ConsultationStepRepository::class)
            ->findOneBy(['slug' => $consultationStepSlug])
        ;
        if (!$user) {
            $output->writeln(
                '<error>Unknown user' .
                    $userEmail .
                    '. Please provide an existing user email.</error>'
            );
            $output->writeln('<error>Import cancelled. No opinion created.</error>');

            return 1;
        }

        if (!$consultationStep) {
            $output->writeln(
                '<error>Unknown consultation step' .
                    $consultationStepSlug .
                    '. Please provide an existing consultation step slug.</error>'
            );
            $output->writeln('<error>Import cancelled. No opinion created.</error>');

            return 1;
        }

        if (!$consultationStep->getFirstConsultation()) {
            $output->writeln(
                '<error>Consultation step' .
                    $consultationStepSlug .
                    ' does not have a consultation step type associated Please create it then try importing data again.</error>'
            );
            $output->writeln('<error>Import cancelled. No opinion created.</error>');

            return 1;
        }

        $opinions = $this->getOpinions();

        if (!$opinions || 0 === \count($opinions)) {
            $output->writeln(
                '<error>File "opinions.csv" is not provided, is empty or could not be parsed.</error>'
            );
            $output->writeln('<error>Import cancelled. No opinion created.</error>');

            return 1;
        }

        $count = \count($opinions);
        $progress = new ProgressBar($output, $count);
        $progress->start();

        $i = 1;
        /**
         * @var Row $row
         */
        foreach ($opinions as $key => $row) {
            if (0 === $key) {
                continue;
            }
            $row = $row->toArray();
            /** @var null|OpinionType $opinionType */
            $opinionType = null;
            foreach (explode('|', (string) $row[1]) as $index => $ot) {
                if (0 === $index) {
                    $opinionType = $this->getContainer()
                        ->get(OpinionTypeRepository::class)
                        ->findOneBy([
                            'title' => $ot,
                            'parent' => null,
                            'consultation' => $consultationStep->getFirstConsultation(),
                        ])
                    ;
                } else {
                    $opinionType = $this->getContainer()
                        ->get(OpinionTypeRepository::class)
                        ->findOneBy(['title' => $ot, 'parent' => $opinionType])
                    ;
                }
            }

            if (!$opinionType) {
                $output->writeln(
                    '<error>Opinion type with path ' .
                        $row[1] .
                        ' does not exist for this consultation step (specified for opinion ' .
                        $row[0] .
                        ').</error>'
                );
                $output->writeln('<error>Import cancelled. No opinion created.</error>');

                return 1;
            }

            $opinion = $this->getContainer()
                ->get(OpinionRepository::class)
                ->findOneBy([
                    'title' => $row[0],
                    'consultation' => $consultationStep->getFirstConsultation(),
                ])
            ;
            if (\is_object($opinion) && !$input->getOption('force')) {
                $output->writeln(
                    '<error>Opinion with title "' .
                        $row[0] .
                        '" already exists in this consultation step. Please change the title or specify the force option to import it anyway.</error>'
                );
                $output->writeln('<error>Import cancelled. No opinion created.</error>');

                return 1;
            }

            if (!\is_object($opinion)) {
                $opinion = new Opinion();
            }

            $opinion->setTitle($row[0]);
            $opinion->setBody($row[2]);
            $opinion->setConsultation($consultationStep->getFirstConsultation());

            $opinion->setOpinionType($opinionType);
            $opinion->setAuthor($user);
            $opinion->setPosition($i);
            $opinion->setPublishedAt(new \DateTime());
            ++$i;

            $em->persist($opinion);

            $progress->advance();
        }

        $em->flush();
        $progress->finish();

        $output->writeln(
            '<info>' . (\count($opinions) - 1) . ' opinions successfully created.</info>'
        );

        return 0;
    }

    /**
     * @throws \Box\Spout\Common\Exception\IOException
     * @throws \Box\Spout\Common\Exception\UnsupportedTypeException
     * @throws \Box\Spout\Reader\Exception\ReaderNotOpenedException
     */
    protected function getOpinions(): array
    {
        /** @var Reader $reader */
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');

        $reader->open($this->filePath);
        $rows = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    private function getContainer()
    {
        return $this->container;
    }
}
