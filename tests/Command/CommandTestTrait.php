<?php

namespace Capco\Tests\Command;

use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Finder\Finder;

trait CommandTestTrait
{
    public function executeFirstCommand(string $name): array
    {
        $this->emptyOutputDirectory();

        list($commandTester, $options) = $this->setUpCommandTester($name);

        $commandTester->execute($options);

        return [$commandTester, $options];
    }

    public function setUpCommandTester(string $name): array
    {
        $application = new Application(self::$kernel);

        $command = $application->find($name);

        $commandTester = new CommandTester($command);

        $options = [
            'command' => $command->getName(),
            '--delimiter' => ',',
            '--force' => InputOption::VALUE_NONE,
        ];

        return [$commandTester, $options];
    }

    public static function getCompletedFileNames(string $suffix): array
    {
        $completedFileNames = [];

        foreach (self::EXPECTED_FILE_NAMES as $fileName) {
            $completedFileNames[] = $fileName . $suffix;
        }

        return $completedFileNames;
    }

    public function updateUser(string $id): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
        $user->setUpdatedAt(new \DateTime('2027-01-01 00:06:00'));
        $em->persist($user);
        $em->flush();
    }

    public function resetUserUpdatedAt(string $id): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();

        /** @var User $user */
        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
        $user->resetUpdatedAt();
        $em->persist($user);
        $em->flush();
    }

    private function executeCommand(string $name): array
    {
        $application = new Application(self::$kernel);

        $command = $application->find($name);

        $commandTester = new CommandTester($command);

        $options = [
            'command' => $command->getName(),
            '--delimiter' => ',',
            '--force' => InputOption::VALUE_NONE,
        ];

        $commandTester->execute($options);

        $this->assertSame(0, $commandTester->getStatusCode());

        $actualOutputs = [];

        $finder = new Finder();
        $finder->files()->in(self::OUTPUT_DIRECTORY);

        foreach ($finder as $file) {
            $fileName = $file->getRelativePathname();

            $isDirectory = $file->isDir();

            if (!$isDirectory) {
                $actualOutputs[$fileName] = file_get_contents(self::OUTPUT_DIRECTORY . '/' . $fileName);
            }
        }

        return $actualOutputs;
    }

    private function emptyOutputDirectory(): void
    {
        $finder = new Finder();
        $finder->files()->in(self::OUTPUT_DIRECTORY);

        foreach ($finder as $file) {
            $fileName = $file->getRelativePathname();

            $isDirectory = $file->isDir();

            if (!$isDirectory) {
                unlink(self::OUTPUT_DIRECTORY . '/' . $fileName);
            }
        }
    }

    private function assertOutputs(array $actualOutputs, array $expectedFiles): void
    {
        $finder = new Finder();
        $finder->files()->in(self::EXPECTED_DIRECTORY)->name($expectedFiles);

        foreach ($finder as $file) {
            $expectedFileName = $file->getRelativePathname();

            $isDirectory = $file->isDir();

            if (!$isDirectory) {
                $this->assertArrayHasKey($expectedFileName, $actualOutputs);

                $expectedOutput = file_get_contents(self::EXPECTED_DIRECTORY . '/' . $expectedFileName);
                $actualOutput = $actualOutputs[$expectedFileName];

                $this->assertSame($expectedOutput, $actualOutput);
            }
        }
    }
}
