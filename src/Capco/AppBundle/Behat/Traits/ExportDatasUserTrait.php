<?php

namespace Capco\AppBundle\Behat\Traits;

trait ExportDatasUserTrait
{
    /**
     * @Then there should be a personal data archive for user :userId
     */
    public function iCheckIfTheArchiveIsCreatedForTheUser(string $userId)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);

        if (!$archive) {
            throw new \Exception('UserArchive does not exist.');
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';
        \PHPUnit_Framework_Assert::assertFileExists("$directory/$archiveFile");
    }

    /**
     * @Then the archive for user :userId should be deleted
     */
    public function iCheckIfTheArchiveIsDeletedForTheUser(string $userId)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);

        if (!$archive) {
            throw new \Exception('UserArchive does not exist.');
        }

        $archiveFile = $archive;
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';

        \PHPUnit_Framework_Assert::assertFileNotExists("$directory/$archiveFile");
    }
}
