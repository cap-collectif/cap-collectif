<?php

namespace Capco\AppBundle\Behat\Traits;

use Capco\AppBundle\Command\CreateCsvFromUserCommand;
use PHPUnit\Framework\Assert;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;

trait ExportDatasUserTrait
{
    /**
     * @Then personal data archive for user :userId should match its snapshot
     */
    public function iCheckIfTheArchiveIsCreatedForTheUser(string $userId)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        if (!$user) {
            throw new \RuntimeException("User with id {$userId} does not exist.");
        }
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);
        if (!$archive) {
            throw new \RuntimeException("UserArchive with id {$userId} does not exist.");
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.project_dir') . '/public/export/';
        $exportedArchiveZipFile = "{$directory}{$archiveFile}";
        Assert::assertFileExists($exportedArchiveZipFile);

        // Extract the .zip file
        $zip = new \ZipArchive();
        $res = $zip->open($exportedArchiveZipFile);
        if (true === $res) {
            $extractTo = $directory . '__unziped__/';
            $zip->extractTo($extractTo);
            $zip->close();
        } else {
            throw new \RuntimeException("${$exportedArchiveZipFile} can't be open.");
        }

        $matchTo = CreateCsvFromUserCommand::getSnapshotDir($userId);

        // Check that all CSV files match their snapshot
        foreach (
            (new Finder())
                ->files()
                ->name('*.csv')
                ->in($matchTo)
            as $file
        ) {
            $this->exportContext->compareFileWithSnapshot(
                $extractTo . $file->getRelativePathname(),
                $matchTo . $file->getRelativePathname()
            );
        }
        // @TODO we do not compare media (eg: .jpg) for now

        Process::fromShellCommandline('rm -rf ' . $extractTo)->mustRun();
    }

    /**
     * @Then the archive for user :userId should be deleted
     */
    public function iCheckIfTheArchiveIsDeletedForTheUser(string $userId)
    {
        $em = $this->getEntityManager();
        $em->clear();

        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);

        // Disable the built-in softdelete
        if ($em->getFilters()->isEnabled('softdeleted')) {
            $em->getFilters()->disable('softdeleted');
        }
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);

        if (!$archive) {
            throw new \Exception('UserArchive does not exist.');
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.project_dir') . '/../public/export/';

        Assert::assertFileNotExists("{$directory}/{$archiveFile}");
    }
}
