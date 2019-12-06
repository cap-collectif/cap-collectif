<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportStructureFromCsvCommand extends Command
{
    public $rootOpinionTypes = [];
    public $filePath;
    private $em;
    private $convertCsvToArray;

    public function __construct(
        string $name = null,
        EntityManagerInterface $em,
        ConvertCsvToArray $convertCsvToArray
    ) {
        $this->em = $em;
        $this->convertCsvToArray = $convertCsvToArray;
        parent::__construct($name);
    }

    public function findOpinionTypeByPath($path, $types)
    {
        $opinionTypeTitles = explode('|', $path, 2);
        $current = $opinionTypeTitles[0];

        foreach ($types as $type) {
            if ($type->getTitle() === $current) {
                $next = $opinionTypeTitles[1] ?? null;
                if (!$next) {
                    return $type;
                }

                return $this->findOpinionTypeByPath($next, $type->getChildren());
            }
        }

        throw new \InvalidArgumentException('Unknown opinion title: "' . $current . '"', 1);
    }

    protected function configure()
    {
        $this->setName('capco:import:structure-from-csv')
            ->setDescription(
                'Import consultation from CSV file with specified author and consultation step'
            )
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'name',
                InputArgument::REQUIRED,
                'Please provide the name of the structure to create.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);
    }

    protected function getOpinionTypes()
    {
        return $this->convertCsvToArray->convert($this->filePath);
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $this->filePath = $input->getArgument('filePath');
        $name = $input->getArgument('name');

        $appendixType = $this->em
            ->getRepository('CapcoAppBundle:AppendixType')
            ->findOneBySlug('expose-des-motifs');

        $consultation = new Consultation();
        $consultation->setTitle($name);
        $this->em->persist($consultation);
        $this->em->flush();

        $data = $this->getOpinionTypes();
        $progress = new ProgressBar($output, \count($data));
        $progress->start();

        foreach ($data as $key => $row) {
            $opinionType = new OpinionType();
            $opinionType->setTitle($row['title']);
            $opinionType->setSubtitle($row['subtitle']);
            $opinionType->setPosition($key);
            $opinionType->setColor('blue');
            $opinionType->setDefaultFilter('positions');
            $opinionType->setIsEnabled($row['contribuable']);
            $opinionType->setVersionable($row['contribuable']);

            $exposayDayMotifType = new OpinionTypeAppendixType();
            $exposayDayMotifType->setAppendixType($appendixType);
            $exposayDayMotifType->setPosition(1);
            $opinionType->addAppendixType($exposayDayMotifType);

            if (!empty($row['parent'])) {
                $parent = $this->findOpinionTypeByPath($row['parent'], $this->rootOpinionTypes);
                $parent->addChild($opinionType);
            }

            $opinionType->setConsultation($consultation);

            $this->em->persist($opinionType);
            $this->em->flush();

            if (!$opinionType->getParent()) {
                $this->rootOpinionTypes[] = $opinionType;
            }
            $progress->advance(1);
        }

        $output->writeln('Structure successfully created.');

        $this->em->flush();
        $progress->finish();
    }
}
