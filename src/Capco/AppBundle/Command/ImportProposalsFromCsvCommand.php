<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\District;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCategory;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Utils\Map;
use Capco\AppBundle\Utils\Text;
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
        'author',
        'district_name',
        'address',
        'collect_status',
        'estimation',
        'category',
        'summary',
        'body',
    ];
    private $filePath;
    private $delimiter;
    private $om;
    private $proposalForm;
    private $questionsMap;
    private $newUsersMap;

    protected function configure()
    {
        $this->setName('capco:import:proposals-from-csv')
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
            )
            ->addArgument('delimiter', InputArgument::OPTIONAL, ', or ;');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        return $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output): int
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getArgument('delimiter');
        $proposalFormId = $input->getArgument('proposal-form');
        $map = $this->getContainer()->get(Map::class);

        $this->om = $this->getContainer()
            ->get('doctrine')
            ->getManager();

        /* @var ProposalForm $proposalForm */
        $this->proposalForm = $this->getContainer()
            ->get('capco.proposal_form.repository')
            ->find($proposalFormId);
        $this->questionsMap = [];
        $this->newUsersMap = [];

        if (null === $this->proposalForm) {
            $output->writeln(
                '<error>Proposal Form with id ' .
                    $proposalFormId .
                    ' was not found in your database. Please create it or change the id.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        $rows = $this->getRows();
        $count = \count($rows);

        if (0 === $count) {
            $output->writeln(
                '<error>Your file with path ' .
                    $this->filePath .
                    ' was not found or no proposal was found in your file. Please verify your path and file\'s content.</error>'
            );
            $output->writeln('<error>Import cancelled. No proposal was created.</error>');

            return 1;
        }

        $progress = new ProgressBar($output, $count - 1);
        $progress->start();

        $loop = 1;
        foreach ($rows as $row) {
            // if first line : check if headers are valid
            if (1 === $loop) {
                if (!$this->isValidHeaders($row, $output)) {
                    return $this->generateContentException($output);
                }
            } else {
                if (!$this->isValidRow($row, $output)) {
                    return $this->generateContentException($output);
                }

                $proposal = new Proposal();
                $proposal->setTitle(Text::escapeHtml($row[0]));

                /** @var User $author */
                $author = $this->getContainer()
                    ->get('capco.user.repository')
                    ->findOneBy([
                        'email' => $row[1],
                    ]);

                if (!$author) {
                    if (filter_var($row[1], FILTER_VALIDATE_EMAIL)) {
                        $output->writeln(
                            '<error>Could not find user for "' . $row[1] . '"</error>'
                        );

                        return 1;
                    }
                    if (!isset($this->newUsersMap[trim($row[1])])) {
                        $output->writeln(
                            '<info>Creating a new user with a fake email and username: ' .
                                $row[1] .
                                '</info>'
                        );
                        $this->newUsersMap[trim($row[1])] = $this->createUserFromUsername(
                            trim($row[1])
                        );
                    }
                    $author = $this->newUsersMap[trim($row[1])];
                }

                $district = $this->getContainer()
                    ->get('capco.district.repository')
                    ->findOneBy([
                        'name' => trim($row[2]),
                        'form' => $this->proposalForm,
                    ]);

                $status = $this->getContainer()
                    ->get('capco.status.repository')
                    ->findOneBy([
                        'name' => trim($row[4]),
                        'step' => $this->proposalForm->getStep(),
                    ]);

                if (null === $author) {
                    return $this->generateContentException($output);
                }

                $proposal->setAuthor($author);
                $proposal->setProposalForm($this->proposalForm);
                $proposal->setDistrict($district);
                $proposal->setStatus($status);
                if ('' !== $row[3]) {
                    $proposal->setAddress($map->getFormattedAddress($row[3]));
                }

                if ('' !== $row[5]) {
                    $proposal->setEstimation((float) $row[5]);
                }

                if ('' !== $row[6]) {
                    $proposalCategory = $this->getContainer()
                        ->get('capco.proposal_category.repository')
                        ->findOneBy([
                            'name' => trim($row[6]),
                            'form' => $this->proposalForm,
                        ]);
                    $proposal->setCategory($proposalCategory);
                }

                if ('' !== $row[7]) {
                    $proposal->setSummary(Text::escapeHtml($row[7]));
                }

                $proposal->setBody(Text::escapeHtml($row[8]));

                if (\count($row) > \count(self::HEADERS)) {
                    for ($i = \count(self::HEADERS); isset($row[$i]); ++$i) {
                        $reponse = (new ValueResponse())
                            ->setQuestion($this->questionsMap[$i])
                            ->setValue($row[$i]);
                        $proposal->addResponse($reponse);
                    }
                }

                $this->om->persist($proposal);
            }

            ++$loop;
        }

        try {
            $this->om->flush();
        } catch (\Exception $e) {
            $output->writeln(
                '<error>Error when flushing proposals : ' . $e->getMessage() . '</error>'
            );

            return 1;
        }

        $progress->finish();

        $output->writeln(
            '<info>' . (\count($rows) - 1) . ' proposals successfully created.</info>'
        );

        return 0;
    }

    protected function createUserFromUsername(string $username)
    {
        $userManager = $this->getContainer()->get('fos_user.user_manager');

        $user = $userManager->createUser();
        $user->setUsername($username);
        $user->setEmail(
            filter_var($username . '@fake-email-cap-collectif.com', FILTER_SANITIZE_EMAIL)
        );
        $user->setPlainPassword('ykWc+ud(4vza2|');
        $user->setEnabled(true);
        $this->om->persist($user);

        return $user;
    }

    protected function isValidRow($row, $output): bool
    {
        $hasError = false;
        if (\count($row) < \count(self::HEADERS)) {
            $hasError = true;
        }

        // name, author are mandatory
        if ('' === $row[0] || '' === $row[1]) {
            $hasError = true;
        }

        if ($hasError) {
            return $this->generateContentException($output);
        }

        return true;
    }

    protected function isValidHeaders($row, $output): bool
    {
        if (self::HEADERS !== $row) {
            if (\count($row) > \count(self::HEADERS)) {
                for ($i = \count(self::HEADERS); isset($row[$i]); ++$i) {
                    $found = false;
                    foreach ($this->proposalForm->getRealQuestions() as $question) {
                        if ($question->getTitle() === $row[$i]) {
                            $this->questionsMap[$i] = $question;
                            $found = true;
                        }
                    }
                    if (!$found) {
                        $output->writeln(
                            '<error>Error could not find question "' . $row[$i] . '"</error>'
                        );

                        return false;
                    }
                }

                return true;
            }
            $output->writeln('<error>Error headers not correct</error>');

            return false;
        }

        return true;
    }

    protected function getRows(): array
    {
        try {
            return Reader::createFromPath($this->filePath)
                ->setDelimiter($this->delimiter ?? ';')
                ->fetchAll();
        } catch (\RuntimeException $e) {
            return [];
        }
    }

    protected function generateContentException($output)
    {
        $output->writeln('<error>Content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No proposal was created.</error>');

        return 1;
    }
}
