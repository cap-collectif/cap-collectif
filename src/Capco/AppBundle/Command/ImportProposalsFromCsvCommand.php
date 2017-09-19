<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Status;
use Capco\UserBundle\Entity\User;
use GuzzleHttp\Client;
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

        /** @var ProposalForm $proposalForm */
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

                /** @var User $author */
                $author = $om->getRepository(User::class)->findOneBy([
                    'email' => $row[1],
                ]);

                $district = $om->getRepository(District::class)->findOneBy([
                    'name' => $row[2],
                ]);

                $status = $om->getRepository(Status::class)->findOneBy([
                    'name' => $row[4],
                    'step' => $proposalForm->getStep(),
                ]);

                if (null === $author || null === $district || null === $status) {
                    $this->generateContentException($output);
                }

                $proposal->setAuthor($author);
                $proposal->setProposalForm($proposalForm);
                $proposal->setDistrict($district);
                $proposal->setStatus($status);
                $proposal->setAddress($this->getFormattedAddress($row[3]));

                if ($row[5] !== '') {
                    $proposal->setEstimation((float) $row[5]);
                }

                if ($row[6] !== '') {
                    $proposalCategory = $om->getRepository(ProposalCategory::class)->findOneBy([
                        'name' => $row[6],
                        'form' => $proposalForm,
                    ]);

                    if (null !== $proposalCategory) {
                        $proposal->setCategory($proposalCategory);
                    }
                }

                if ($row[7] !== '') {
                    $proposal->setSummary($this->escapeHtml($row[7]));
                }

                $proposal->setBody($row[8]);

                $om->persist($proposal);
            }

            ++$loop;
        }

        try {
            $om->flush();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>Error when flushing proposals : ' . $e->getMessage() . '</error>');
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');
            exit;
        }

        $progress->finish();

        $output->writeln(
            '<info>'
            . count($proposals) - 1 .
            ' proposals successfully created.</info>'
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
            '<error>Content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No proposal was created.</error>');

        exit;
    }

    protected function getFormattedAddress($address)
    {
        $apiKey = $this->getContainer()->getParameter('google_maps_key');
        $updatedAddress = null;

        $endpoint = "https://maps.googleapis.com/maps/api/geocode/json?address=$address&key=$apiKey";

        $client = new Client();
        $res = $client->request('GET', $endpoint);

        $content = json_decode($res->getBody()->getContents(), true);

        if ($content['status'] === 'OK') {
            // todo when api work ..
        }

        return $updatedAddress;
    }
}
