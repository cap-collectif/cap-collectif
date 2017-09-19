<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\UserBundle\Entity\User;
use League\Csv\Reader;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportProposalsFromCsvCommand extends ContainerAwareCommand
{
    const HEADERS = [
        'name',
        'email_author',
        'district_name',
        'address',
        'collect_status',
        'estimation',
        'category',
        'summary',
        'body',
    ];
    private $filePath;

    protected function configure()
    {
        $this
            ->setName('capco:import:proposals-from-csv')
            ->setDescription('Import proposals from CSV file with specified proposal form id')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'proposal-form',
                InputArgument::REQUIRED,
                'Please provide the proposal form id where you want to import proposals.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $this->filePath = $input->getArgument('filePath');
        $proposalFormId = $input->getArgument('proposal-form');

        $om = $this->getContainer()->get('doctrine')->getManager();

        $proposalForm = $om->getRepository(ProposalForm::class)->find($proposalFormId);

        if ($proposalForm === null) {
            $output->writeln(
                '<error>Proposal Form with id '
                . $proposalFormId .
                ' was not found in your database. Please create it or change the id.</error>');
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');
        }

        $proposals = $this->getProposals();

        if (!$proposals || count($proposals) === 0) {
            $output->writeln(
                '<error>Your file with path '
                . $this->filePath .
                ' was not found or no proposal was found in your file. Please verify your path and file\'s content.</error>');
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');
        }

        $count = count($proposals);
        $progress = new ProgressBar($output, $count);
        $progress->start();

        $loop = 1;
        foreach ($proposals as $row) {
            // if first line : check if headers are valid
            if ($loop === 1) {
                if (!$this->isValidHeaders($row, $output)) {
                    exit;
                }
            } else {
                if (!$this->isValidRow($row, $output)) {
                    $this->generateContentException($output);
                }

                $proposal = new Proposal();
                $proposal->setTitle($this->escapeHtml($row[0]));

                $author = $om->getRepository(User::class)->findOneBy([
                    'email' => $row[1],
                ]);

                var_dump($author);
                exit;
                if (null === $author) {
                    $this->generateContentException($output);
                }

                var_dump($row);
            }

            ++$loop;
        }

        error_log('yeah');
        die('aaa');

        $em->flush();
        $progress->finish();

        $output->writeln(
            '<info>'
            . count($opinions) .
            ' opinions successfully created.</info>'
        );

        return 0;
    }

    protected function isValidRow($row, $output): bool
    {
        $hasError = false;
        if (count($row) !== count(self::HEADERS)) {
            $hasError = true;
        }

        // name, email, collect_status, category are mandatory
        if ($row[0] === '' || $row[1] === '' || $row[4] === '' || $row[6] === '') {
            $hasError = true;
        }

        if ($hasError) {
            $this->generateContentException($output);
        }

        return true;
    }

    protected function isValidHeaders($row, $output): bool
    {
        if ($row !== self::HEADERS) {
            $this->generateContentException($output);
        }

        return true;
    }

    protected function getProposals(): array
    {
        try {
            return Reader::createFromPath($this->filePath)
                ->setDelimiter(';')
                ->fetchAll();
        } catch (\RuntimeException $e) {
            return [];
        }
    }

    protected function escapeHtml($str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE);
    }

    protected function generateContentException($output)
    {
        $output->writeln(
            '<error>Your content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No proposal was created.</error>');

        exit;
    }
}
