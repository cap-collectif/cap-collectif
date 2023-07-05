<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUsersFromCsvCommand extends AbstractImportCsvCommand
{
    public const HEADER_USERNAME = 'username';
    public const HEADER_EMAIL = 'email';
    public const HEADER_PASSWORD = 'password';

    protected UserManager $userManager;
    protected array $createdEmails = [];
    protected array $createdUsernames = [];

    public function __construct(
        ?string $name,
        UserManager $userManager,
        ConvertCsvToArray $csvReader
    ) {
        parent::__construct($name, $csvReader);
        $this->userManager = $userManager;
    }

    protected function configure()
    {
        parent::configure();
        $this->setDescription('Import users from a CSV file');
    }

    protected function getRowErrors(array &$row): array
    {
        $errors = [];
        $this->checkEmail($errors, $row[self::HEADER_EMAIL]);
        if (empty($row[self::HEADER_PASSWORD])) {
            $errors[] = 'missing password';
        }

        return $errors;
    }

    protected function importRow(array $row): void
    {
        $user = $this->generateUser($row[self::HEADER_USERNAME], $row[self::HEADER_EMAIL]);
        $user->setPlainpassword($row[self::HEADER_PASSWORD]);

        if (!$this->dryRun) {
            $this->userManager->updateUser($user);
        }
    }

    protected function handleRuntimeException(
        \RuntimeException $exception,
        OutputInterface $output
    ): int {
        if (self::ERROR_NO_FILE === $exception->getMessage()) {
            $output->writeln("<error>File {$this->filePath} not found !</error>");
        } elseif (self::ERROR_EMPTY_FILE === $exception->getMessage()) {
            $output->writeln('<error>No user found in file ! Maybe wrong delimiter ?</error>');
        } else {
            throw $exception;
        }

        return 1;
    }

    protected function successMessage(int $successCount, OutputInterface $output): int
    {
        $output->writeln("<info>{$successCount} users successfully created.</info>");

        return 0;
    }

    protected function generateUser(string $username, string $email): User
    {
        $user = new User();
        $user->setUsername($username);
        $user->setEmail(filter_var($email, \FILTER_SANITIZE_EMAIL));
        $user->setEnabled(true);

        $this->createdEmails[] = $user->getEmail();
        $this->createdUsernames[] = $user->getUsername();

        return $user;
    }

    protected function checkEmail(array &$errors, $email): void
    {
        if (empty($email)) {
            $errors[] = 'missing email';
        } elseif ($this->isEmailAlreadyUsed($email)) {
            $errors[] = "email {$email} is already used";
        }
    }

    private function isEmailAlreadyUsed(string $email): bool
    {
        if (\array_key_exists($email, $this->createdEmails)) {
            return true;
        }
        if ($this->userManager->findUserByEmail($email)) {
            return true;
        }

        return false;
    }
}
