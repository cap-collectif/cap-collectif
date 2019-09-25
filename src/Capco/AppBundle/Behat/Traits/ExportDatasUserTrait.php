<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;
use Capco\AppBundle\Command\CreateCsvFromUserCommand;

trait ExportDatasUserTrait
{
    /**
     * @Then personal data archive for user :userId should match its snapshot
     */
    public function iCheckIfTheArchiveIsCreatedForTheUser(string $userId)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);
        if (!$archive) {
            throw new \RuntimeException("UserArchive with id ${userId} does not exist.");
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.project_dir') . '/web/export/';
        $exportedArchiveZipFile = "${directory}${archiveFile}";
        Assert::assertFileExists($exportedArchiveZipFile);

        // Extract the .zip file
        $zip = new \ZipArchive();
        $zip->open($exportedArchiveZipFile);
        $extractTo = $directory . '__unziped__/';
        $zip->extractTo($extractTo);
        $zip->close();

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

        (new Process('rm -rf ' . $extractTo))->mustRun();
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
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';

        Assert::assertFileNotExists("${directory}/${archiveFile}");
    }
}
