<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Helper\GlobalFunctionsHelper;
use Box\Spout\Writer\CSV\Writer;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUserAccountsFromCSVWithPasswordCommand extends Command
{
    protected $csvWriter;
    protected $csvReader;
    protected $userManager;

    public function __construct(
        Writer $csvWriter,
        ConvertCsvToArray $csvReader,
        UserManagerInterface $userManager
    ) {
        $this->csvWriter = $csvWriter;
        $this->csvReader = $csvReader;
        $this->userManager = $userManager;
        $this->csvWriter->setGlobalFunctionsHelper(new GlobalFunctionsHelper());

        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:create-users-account-from-csv:password')
            ->addArgument(
                'input',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'output',
                InputArgument::REQUIRED,
                'Please provide the path of the export.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $inputFilePath = $input->getArgument('input');
        $outputFilePath = $input->getArgument('output');
        $rows = $this->csvReader->convert($inputFilePath);

        $createdCount = 0;
        $this->csvWriter->openToFile($outputFilePath);
        $this->csvWriter->addRow(['email', 'password']);
        foreach ($rows as $row) {
            try {
                $user = $this->userManager->createUser();
                $user->setUsername($row['username']);
                $user->setEmail(filter_var($row['email'], FILTER_SANITIZE_EMAIL));
                $user->setEnabled(true);
                $password = $this->generateRandomPassword();
                $user->setPlainPassword($password);
                $this->userManager->updateUser($user);
                $this->csvWriter->addRow([$user->getEmail(), $password]);
                ++$createdCount;
            } catch (\Exception $e) {
                $output->write($e->getMessage());
                $output->write('Failed to create user : ' . $row['email']);
            }
        }
        $this->csvWriter->close();
        $output->write($createdCount . ' users created.');
    }

    private function generateRandomPassword(): string
    {
        $password = '';
        $desiredLength = random_int(8, 12);

        for ($length = 0; $length < $desiredLength; $length++) {
            $password .= \chr(random_int(32, 126));
        }

        return $password;
    }
}
