<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateIDFUsersFromCsvCommand extends CreateUsersFromCsvCommand
{
    const HEADERS = ['username', 'email', 'openid_id'];
    protected UserManagerInterface $userManager;
    protected ConvertCsvToArray $csvReader;
    private UserRepository $userRepository;

    public function __construct(
        ?string $name,
        UserManagerInterface $userManager,
        ConvertCsvToArray $csvReader,
        UserRepository $userRepository
    ) {
        $this->userRepository = $userRepository;
        parent::__construct($name, $userManager, $csvReader);
    }

    protected function configure()
    {
        $this->addArgument(
            'filePath',
            InputArgument::REQUIRED,
            'Please provide the path of the file you want to use.'
        )->addOption('delimiter', 'd', InputOption::VALUE_OPTIONAL, 'Delimiter used in csv', ';');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $filePath = $input->getArgument('filePath');
        $delimiter = $input->getOption('delimiter');

        $rows = $this->csvReader->convert($filePath, $delimiter);

        $count = \count($rows);

        if (0 === $count) {
            $output->writeln(
                '<error>Your file with path ' .
                    $filePath .
                    ' was not found or no user was found in your file. Please verify your path and file\'s content.</error>'
            );
            $output->writeln('<error>Import cancelled. No user was created.</error>');

            return 1;
        }

        $deduplicatedRows = $this->deduplicateEmail($rows, $output);

        $progress = new ProgressBar($output, \count($deduplicatedRows));
        $progress->start();

        $this->loopRows($deduplicatedRows, $output, $progress);

        $progress->finish();

        $output->writeln(
            '<info>' . \count($deduplicatedRows) . ' users successfully created.</info>'
        );

        return 0;
    }

    protected function createUser(array $row): void
    {
        $email = filter_var($row['email'], \FILTER_SANITIZE_EMAIL);

        /** @var User $user */
        $user = $this->userManager->createUser();
        $user->setEmail($email);

        $user->setUsername($row['username']);
        $user->setOpenId($row['openid_id']);
        $user->setEnabled(true);
        $this->userManager->updateUser($user);
    }

    private function deduplicateEmail(array $rows, OutputInterface $output): array
    {
        $deduplicatedRows = [];

        foreach ($rows as $row) {
            if ($row instanceof Row) {
                $row = $row->toArray();
            }
            $needle = $row['email'];
            if (isset($deduplicatedRows[$needle])) {
                continue;
            }
            if($this->userRepository->findOneByEmail($needle)) {
                continue;
            }
            $deduplicatedRows[$needle] = $row;
        }
        if (\count($rows) > \count($deduplicatedRows)) {
            $output->writeln(
                '<info> Skipping ' .
                    (\count($rows) - \count($deduplicatedRows)) .
                    ' duplicated email(s).</info>'
            );
        }

        return $deduplicatedRows;
    }
}
