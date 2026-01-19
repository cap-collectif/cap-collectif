<?php

namespace Capco\Tests\Command;

use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Finder\Finder;

trait CommandTestTrait
{
    /**
     * @return array<int, array<string, null|int|string>|CommandTester>
     */
    public function executeFirstCommand(string $name, string $outputDir = self::OUTPUT_DIRECTORY): array
    {
        $this->emptyOutputDirectory($outputDir);

        [$commandTester, $options] = $this->setUpCommandTester($name);

        $commandTester->execute($options);

        return [$commandTester, $options];
    }

    /**
     * @return array<int, array<string, null|int|string>|CommandTester>
     */
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

    /**
     * @param array<int, string>|array<string, array<int, string>> $expectedFileNames
     *
     * @return array<int, string>
     */
    public static function getCompletedFileNames(string $suffix, array $expectedFileNames = self::EXPECTED_FILE_NAMES): array
    {
        $completedFileNames = [];

        foreach ($expectedFileNames as $fileName) {
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

    /**
     * @param array<int, string>          $outputDirs
     * @param array<string,  int|string > $customOptions
     *
     * @return array<string, bool|string>
     */
    private function executeCommand(string $name, array $outputDirs = [self::OUTPUT_DIRECTORY], array $customOptions = []): array
    {
        $application = new Application(self::$kernel);

        $command = $application->find($name);

        $commandTester = new CommandTester($command);

        $options = [
            'command' => $command->getName(),
            '--delimiter' => ',',
            '--force' => InputOption::VALUE_NONE,
            ...$customOptions,
        ];

        $commandTester->execute($options);

        $this->assertSame(0, $commandTester->getStatusCode());

        $actualOutputs = [];

        foreach ($outputDirs as $outputDir) {
            $finder = new Finder();
            $finder->files()->in($outputDir);

            foreach ($finder as $file) {
                $fileName = $file->getRelativePathname();

                $isDirectory = $file->isDir();

                if (!$isDirectory) {
                    $actualOutputs[$fileName] = file_get_contents($outputDir . '/' . $fileName);
                }
            }
        }

        return $actualOutputs;
    }

    private function emptyOutputDirectory(string $outputDir = self::OUTPUT_DIRECTORY): void
    {
        $finder = new Finder();
        $finder->files()->in($outputDir);

        foreach ($finder as $file) {
            $fileName = $file->getRelativePathname();

            $isDirectory = $file->isDir();

            if (!$isDirectory) {
                unlink($outputDir . '/' . $fileName);
            }
        }
    }

    /**
     * @param array<string, bool|string> $actualOutputs
     * @param string[]                   $expectedFiles
     */
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
