<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;
use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\Process\Process;

trait ExportDatasUserTrait
{
    /**
     * @Then there should be a personal data archive for user :userId
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
        $zip = new \ZipArchive();
        $zip->open($exportedArchiveZipFile);

        $extractTo = $directory . '__unziped__/';

        $zip->extractTo($extractTo);
        $zip->close();

        // Enable this to write or compare snapshots
        $writeSnapshots = EnvHelper::get('SNAPSHOTS');

        $matchTo = "/var/www/__snapshots__/rgpd_user_archives/${userId}/";

        if (!file_exists($matchTo)) {
            mkdir($matchTo, 0700);
        }

        $csvToMatch = [
            'arguments.csv',
            'events.csv',
            'groups.csv',
            'medias.csv',
            'opinions.csv',
            'proposals.csv',
            'sources.csv',
            'user.csv',
            'votes.csv'
        ];

        foreach ($csvToMatch as $csv) {
            $justGeneratedFile = $extractTo . $csv;
            if (file_exists($justGeneratedFile)) {
                if ($writeSnapshots) {
                    (new Process('mv ' . $justGeneratedFile . ' ' . $matchTo . $csv))->mustRun();
                }
                else {
                    $this->exportContext->compareFileWithSnapshot($extractTo . $csv, $matchTo . $csv);
                }
            } else {
                echo "$justGeneratedFile does not exist.";
            }
        }

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
